<script lang="ts">
	import { onMount } from 'svelte';
	import { getSchedule } from '../api';
	import { filters, type MatchStatus } from '../filters.svelte';
	import { dayKey, dayLabel } from '../format';
	import type { ScheduleEvent } from '../types';
	import MatchRow from './MatchRow.svelte';

	type Entry = { event: ScheduleEvent; status: MatchStatus };
	type DayGroup = { key: number; label: string; today: boolean; entries: Entry[] };

	let events = $state<ScheduleEvent[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	// Ticks so countdowns stay honest while the page sits open.
	let now = $state(Date.now());

	onMount(() => {
		load();
		const ticker = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(ticker);
	});

	async function load() {
		const schedule = await getSchedule();
		if (!schedule) {
			status = 'error';
			return;
		}
		events = schedule.events;
		filters.availableLeagues = Array.from(
			new Set(
				schedule.events
					.filter((event) => event.league.slug !== 'tft_esports')
					.map((event) => event.league.name)
			)
		).sort();
		status = 'ready';
	}

	/** A live match is in progress, or a series is mid-way without a recorded outcome. */
	function isLive(event: ScheduleEvent): boolean {
		if (!event.match) return false;
		const [home, away] = event.match.teams;
		const midSeries =
			(home.result && home.result.gameWins > 0 && !home.result.outcome) ||
			(home.result && away.result && away.result.gameWins > 0 && !away.result.outcome);
		return event.state === 'inProgress' || Boolean(midSeries);
	}

	function isRecent(event: ScheduleEvent): boolean {
		if (event.state !== 'completed' && !event.match?.teams[0]?.result?.outcome) return false;
		const minDate = new Date();
		const maxDate = new Date();
		minDate.setDate(minDate.getDate() - 7);
		maxDate.setHours(maxDate.getHours() - 1);
		const eventDate = new Date(event.startTime);
		if (eventDate.valueOf() <= minDate.valueOf() || eventDate.valueOf() >= maxDate.valueOf()) {
			return false;
		}
		return Boolean(event.match?.id);
	}

	function isUpcoming(event: ScheduleEvent): boolean {
		if (!event.match) return false;
		if (
			event.state === 'inProgress' ||
			(event.state === 'completed' && (event.match.teams[0].result?.gameWins ?? 0) > 0) ||
			(event.match.teams[1].result?.gameWins ?? 0) > 0
		) {
			return false;
		}
		const minDate = new Date();
		const maxDate = new Date();
		minDate.setHours(minDate.getHours() - 1);
		maxDate.setDate(maxDate.getDate() + 7);
		const eventDate = new Date(event.startTime);
		if (eventDate.valueOf() <= minDate.valueOf() || eventDate.valueOf() >= maxDate.valueOf()) {
			return false;
		}
		return Boolean(event.match?.id);
	}

	/**
	 * One status per fixture, so a series cannot land in two day buckets. Live
	 * wins over upcoming for a match that is already part-way through.
	 */
	function statusOf(event: ScheduleEvent): MatchStatus | null {
		if (isLive(event)) return 'live';
		if (isUpcoming(event)) return 'upcoming';
		if (isRecent(event)) return 'recent';
		return null;
	}

	const groups = $derived.by(() => {
		const included: Entry[] = [];
		for (const event of events) {
			if (event.league.slug === 'tft_esports') continue;
			if (filters.leagues.size > 0 && !filters.leagues.has(event.league.name)) continue;
			const eventStatus = statusOf(event);
			if (!eventStatus || !filters.matchStatus.has(eventStatus)) continue;
			included.push({ event, status: eventStatus });
		}
		included.sort(
			(a, b) => new Date(a.event.startTime).getTime() - new Date(b.event.startTime).getTime()
		);

		// The agenda runs from today forwards; older fixtures collapse below it.
		const todayKey = dayKey(new Date());
		const agenda: DayGroup[] = [];
		const earlier: DayGroup[] = [];
		for (const entry of included) {
			const key = dayKey(entry.event.startTime);
			const bucket = key >= todayKey ? agenda : earlier;
			const last = bucket[bucket.length - 1];
			if (last && last.key === key) {
				last.entries.push(entry);
			} else {
				bucket.push({
					key,
					label: dayLabel(entry.event.startTime),
					today: key === todayKey,
					entries: [entry]
				});
			}
		}
		earlier.reverse();

		return {
			agenda,
			earlier,
			earlierCount: earlier.reduce((total, day) => total + day.entries.length, 0)
		};
	});
</script>

{#snippet dayGroup(day: DayGroup)}
	<section class="day">
		<h2 class="day-head" class:today={day.today}>
			<span>{day.label}</span>
			<i></i>
		</h2>
		<div class="day-rows">
			{#each day.entries as entry (`${entry.event.match.id}_${entry.event.startTime}`)}
				<MatchRow {entry} {now} />
			{/each}
		</div>
	</section>
{/snippet}

{#if status === 'loading'}
	<p class="agenda-message">Loading schedule…</p>
{:else if status === 'error'}
	<p class="agenda-message">Could not load the schedule.</p>
{:else if groups.agenda.length === 0 && groups.earlier.length === 0}
	<p class="agenda-message">No matches match your filters.</p>
{:else}
	{#if groups.agenda.length === 0}
		<p class="agenda-message">Nothing scheduled from today onward.</p>
	{:else}
		{#each groups.agenda as day (day.key)}
			{@render dayGroup(day)}
		{/each}
	{/if}

	{#if groups.earlier.length > 0}
		<details class="earlier">
			<summary>Earlier results ({groups.earlierCount})</summary>
			{#each groups.earlier as day (day.key)}
				{@render dayGroup(day)}
			{/each}
		</details>
	{/if}
{/if}

<style>
	.agenda-message {
		padding: 48px 0;
		text-align: center;
		color: var(--text-muted);
	}

	.day {
		margin-bottom: 18px;
	}

	.day-head {
		display: flex;
		align-items: center;
		gap: 12px;
		position: sticky;
		/* Clears the site's fixed 64px nav so the current day stays labelled. */
		top: 64px;
		z-index: 1;
		padding: 6px 0;
		background: var(--bg-primary);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.day-head i {
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	.day-head.today {
		color: var(--accent);
	}

	.day-rows {
		display: flex;
		flex-direction: column;
	}

	.earlier {
		margin-top: 28px;
		border-top: 1px solid var(--border);
		padding-top: 14px;
	}

	.earlier summary {
		cursor: pointer;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.earlier summary:hover {
		color: var(--accent);
	}
</style>
