<script lang="ts">
	import type { TeamStats } from '../types';
	import Baron from '../icons/baron.svelte';
	import Gold from '../icons/gold.svelte';
	import Inhibitor from '../icons/inhibitor.svelte';
	import Kill from '../icons/kill.svelte';
	import Tower from '../icons/tower.svelte';

	type Props = {
		teamStats: TeamStats;
		teamColor: string;
	};

	let { teamStats, teamColor }: Props = $props();
</script>

<div class={teamColor}>
	<div class="team-stats inhibitors">
		<Inhibitor />
		{teamStats.inhibitors}
	</div>
	<div class="team-stats barons">
		<Baron />
		{teamStats.barons}
	</div>
	<div class="team-stats towers">
		<Tower />
		{teamStats.towers}
	</div>
	<div class="team-stats gold">
		<Gold />
		<span>{Number(teamStats.totalGold).toLocaleString('en-us')}</span>
	</div>
	<div class="team-stats kills">
		<Kill />
		{teamStats.totalKills}
	</div>
</div>
