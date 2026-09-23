<script lang="ts">
	import ScheduleList from '$lib/esports/components/ScheduleList.svelte';
	import {
		clearLeagues,
		filters,
		toggleLeague,
		toggleMatchStatus,
		type MatchStatus
	} from '$lib/esports/filters.svelte';

	const MATCH_STATUS_OPTIONS: Array<{ value: MatchStatus; label: string }> = [
		{ value: 'live', label: 'Live' },
		{ value: 'upcoming', label: 'Upcoming' },
		{ value: 'recent', label: 'Recent' }
	];
</script>

<svelte:head>
	<title>League Esports | 0xfinder</title>
	<meta name="description" content="Live, upcoming, and recent League of Legends esports matches." />
</svelte:head>

<div class="page-head">
	<h1>League Esports</h1>

	<div class="filters">
		<div class="filter-group" role="group" aria-label="Match status">
			{#each MATCH_STATUS_OPTIONS as option (option.value)}
				<button
					type="button"
					class="filter-chip"
					class:on={filters.matchStatus.has(option.value)}
					aria-pressed={filters.matchStatus.has(option.value)}
					onclick={() => toggleMatchStatus(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>

		{#if filters.availableLeagues.length > 0}
			<div class="filter-group" role="group" aria-label="Leagues">
				<!-- An empty selection means every league, so this is the reset. -->
				<button
					type="button"
					class="filter-chip"
					class:on={filters.leagues.size === 0}
					aria-pressed={filters.leagues.size === 0}
					onclick={() => clearLeagues()}
				>
					All leagues
				</button>
				{#each filters.availableLeagues as league (league)}
					<button
						type="button"
						class="filter-chip"
						class:on={filters.leagues.has(league)}
						aria-pressed={filters.leagues.has(league)}
						onclick={() => toggleLeague(league)}
					>
						{league}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<ScheduleList />

<style>
	.page-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 14px 24px;
		margin-bottom: 28px;
	}

	h1 {
		font-size: 1.9rem;
		font-weight: 700;
		white-space: nowrap;
		color: var(--text-primary);
	}

	.filters {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex: 1;
		min-width: 0;
		flex-wrap: wrap;
		gap: 8px 18px;
	}

	.filter-group {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
	}

	.filter-group + .filter-group {
		border-left: 1px solid var(--border);
		padding-left: 18px;
	}

	.filter-chip {
		padding: 5px 11px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 0.82rem;
		font-weight: 500;
		white-space: nowrap;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			background 0.15s ease;
	}

	.filter-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.filter-chip.on {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-dim);
	}
</style>
