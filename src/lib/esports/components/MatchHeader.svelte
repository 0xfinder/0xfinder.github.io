<script lang="ts">
	import type { EventDetails, Record as TeamRecord, Result, ScheduleEvent } from '../types';
	import TeamTbd from '../icons/team-tbd.svelte';

	type Props = {
		eventDetails: EventDetails;
		matchState: string | undefined;
		records?: TeamRecord[];
		results?: Result[];
		/** Absent once a match ages out of the schedule window; the header degrades. */
		scheduleEvent?: ScheduleEvent;
	};

	let { eventDetails, matchState, records, results, scheduleEvent }: Props = $props();

	// Upstream preferred the standings result and fell back to the match's own.
	const matchResults = $derived(results ?? eventDetails.match.teams.map((team) => team.result));

	const heading = $derived(
		scheduleEvent?.blockName
			? `${eventDetails.league.name} - ${scheduleEvent.blockName} - Best of ${eventDetails.match.strategy.count}`
			: `${eventDetails.league.name} - Best of ${eventDetails.match.strategy.count}`
	);

	const formatTime = (startTime: Date) =>
		new Date(startTime).toLocaleTimeString([], {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
</script>

{#snippet teamCard(index: number)}
	<h1>
		<div class="live-game-card-team">
			{#if eventDetails.match.teams[index].code === 'TBD'}
				<TeamTbd class="live-game-card-team-image" />
			{:else}
				<img
					class="live-game-card-team-image"
					src={eventDetails.match.teams[index].image}
					alt={eventDetails.match.teams[index].name}
				/>
			{/if}
			<span>
				<span class="team-name">{eventDetails.match.teams[index].name}</span>
			</span>
			<span class="outcome">
				{#if matchResults}
					<p class={matchResults[index].outcome}>{matchResults[index].outcome}</p>
				{/if}
			</span>
			{#if records?.[index]}
				<span>
					<p>{records[index].wins} - {records[index].losses}</p>
				</span>
			{/if}
		</div>
	</h1>
{/snippet}

<div>
	<div class="status-live-game-card-content">
		<h3>{heading}</h3>
		{#if scheduleEvent}
			<h3>{formatTime(scheduleEvent.startTime)}</h3>
		{/if}
		<div class="live-game-stats-header">
			<div class="live-game-stats-header-team-images">
				{@render teamCard(0)}
				<h1>
					<div>Match {matchState}</div>
					{#if matchResults}
						<div>{matchResults[0].gameWins}-{matchResults[1].gameWins}</div>
					{/if}
					VS
				</h1>
				{@render teamCard(1)}
			</div>
		</div>
	</div>
</div>
