<script lang="ts">
	import type { EventDetails } from '../types';

	type Props = {
		eventDetails: EventDetails;
		gameIndex: number;
		matchId: string;
	};

	let { eventDetails, gameIndex, matchId }: Props = $props();

	const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
</script>

{#if eventDetails.match.games.length > 1}
	<div class="game-selector">
		{#each eventDetails.match.games as game (game.id)}
			<a
				class="game-selector-item {game.state}"
				class:selected={gameIndex === game.number}
				href="?game={matchId}&g={game.number}"
			>
				<span>Game {game.number} - {capitalize(game.state)}</span>
			</a>
		{/each}
	</div>
{/if}
