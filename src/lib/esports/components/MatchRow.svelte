<script lang="ts">
	import type { MatchStatus } from '../filters.svelte';
	import { clockTime, countdown } from '../format';
	import type { ScheduleEvent } from '../types';

	type Entry = { event: ScheduleEvent; status: MatchStatus };

	type Props = {
		entry: Entry;
		/** Ticks so countdowns stay honest while the page sits open. */
		now: number;
	};

	let { entry, now }: Props = $props();

	const event = $derived(entry.event);
	const status = $derived(entry.status);
	const home = $derived(event.match.teams[0]);
	const away = $derived(event.match.teams[1]);

	// Outcomes are only recorded once a series is decided.
	const decided = $derived(Boolean(home.result?.outcome && away.result?.outcome));
	const homeWon = $derived(home.result?.outcome === 'win');
	const awayWon = $derived(away.result?.outcome === 'win');
	const showScore = $derived(status !== 'upcoming');
</script>

<a
	class="row"
	class:live={status === 'live'}
	class:pending={status === 'upcoming'}
	href="/esports/live?game={event.match.id}"
>
	<time datetime={new Date(event.startTime).toISOString()}>{clockTime(event.startTime)}</time>
	<span class="rail"></span>

	<span class="meta">
		<span class="chip">{event.league.name}</span>
		{#if event.blockName}
			<span class="stage">{event.blockName}</span>
		{/if}
	</span>

	<span class="side home" class:won={homeWon} class:lost={decided && !homeWon}>
		{#if home.code === 'TBD'}
			<span class="logo tbd" aria-hidden="true"></span>
		{:else}
			<img class="logo" src={home.image} alt="" />
		{/if}
		<span class="nm" title={home.name}>{home.name}</span>
	</span>

	<span class="mid">
		{#if showScore}
			<span class="score">{home.result?.gameWins ?? 0}<i>–</i>{away.result?.gameWins ?? 0}</span>
		{:else}
			<span class="vs">v</span>
		{/if}
	</span>

	<span class="side away" class:won={awayWon} class:lost={decided && !awayWon}>
		<span class="nm" title={away.name}>{away.name}</span>
		{#if away.code === 'TBD'}
			<span class="logo tbd" aria-hidden="true"></span>
		{:else}
			<img class="logo" src={away.image} alt="" />
		{/if}
	</span>

	<span class="status">
		{#if status === 'live'}
			<span class="live-tag"><i class="pulse"></i>Live</span>
		{:else if status === 'recent'}
			<span class="final">Final</span>
		{:else}
			<span class="eta">{countdown(event.startTime, now)}</span>
		{/if}
	</span>
</a>

<style>
	.row {
		display: grid;
		align-items: center;
		gap: 14px;
		grid-template-columns: 52px 1px 190px minmax(0, 1fr) 54px minmax(0, 1fr) 74px;
		padding: 9px 10px 9px 0;
		border-radius: 7px;
		color: inherit;
		text-decoration: none;
		transition: background 0.15s ease;
	}

	.row:hover {
		background: var(--bg-secondary);
	}

	time {
		font-variant-numeric: tabular-nums;
		font-size: 0.82rem;
		color: var(--text-secondary);
		text-align: right;
	}

	.rail {
		align-self: stretch;
		border-radius: 1px;
		background: var(--border);
	}

	.row.pending .rail {
		background: var(--accent-glow);
	}

	.row.live .rail {
		background: var(--accent);
	}

	/* A 1px rail alone is too quiet for the one row that matters most. */
	.row.live {
		background: var(--accent-dim);
	}

	.row.live:hover {
		background: var(--accent-glow);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 7px;
		min-width: 0;
	}

	.chip {
		display: inline-block;
		padding: 2px 7px;
		border-radius: 4px;
		background: var(--bg-tertiary);
		color: var(--text-muted);
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.stage {
		font-size: 0.78rem;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.side {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.side.away {
		justify-content: flex-end;
	}

	/*
	 * Team logos are white-on-transparent, so they need a dark plate to stay
	 * visible in light theme.
	 */
	.logo {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		border-radius: 4px;
		background: #2a2e35;
		padding: 2px;
	}

	img.logo {
		object-fit: contain;
	}

	/* A 20px row is too small for the TBD artwork; a placeholder reads better. */
	.logo.tbd {
		background: var(--bg-tertiary);
		border: 1px dashed var(--border);
	}

	.nm {
		font-size: 0.9rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.side.won .nm {
		font-weight: 600;
		color: var(--text-primary);
	}

	.side.lost .nm {
		color: var(--text-muted);
	}

	.mid {
		text-align: center;
	}

	.score {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		font-size: 0.92rem;
	}

	.score i {
		font-style: normal;
		color: var(--text-muted);
		padding: 0 3px;
	}

	.vs {
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.status {
		text-align: right;
	}

	.final {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.eta {
		font-size: 0.76rem;
		color: var(--accent);
	}

	.live-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		animation: pulse 1.6s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	/* Below this the league column costs more than it earns. */
	@media (max-width: 900px) {
		.row {
			grid-template-columns: 46px 1px minmax(0, 1fr) 44px minmax(0, 1fr) 68px;
		}

		.meta {
			display: none;
		}
	}

	/*
	 * On a phone a single line cannot hold two team names, so the row becomes two
	 * stacked lines with the score and status beside them.
	 */
	@media (max-width: 700px) {
		.row {
			grid-template-columns: 46px 1px minmax(0, 1fr) 76px;
			grid-template-rows: auto auto;
			column-gap: 12px;
			row-gap: 3px;
			padding: 8px 8px 8px 0;
		}

		time,
		.rail {
			grid-row: 1 / span 2;
		}

		.side.home {
			grid-column: 3;
			grid-row: 1;
		}

		.side.away {
			grid-column: 3;
			grid-row: 2;
			justify-content: flex-start;
		}

		/* Keep both teams reading left-to-right once stacked. */
		.side.away .logo {
			order: -1;
		}

		.mid {
			grid-column: 4;
			grid-row: 1;
		}

		.status {
			grid-column: 4;
			grid-row: 2;
		}
	}
</style>
