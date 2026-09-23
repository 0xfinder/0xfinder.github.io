<script lang="ts">
	import { CHAMPIONS_URL, getFormattedPatchVersion } from '../api';
	import {
		gameStateLabel,
		getGoldDifference,
		getGoldPercentage,
		getInGameTime,
		patchNotesUrl
	} from '../format';
	import TeamTbd from '../icons/team-tbd.svelte';
	import type {
		DetailsFrame,
		EventDetails,
		GameMetadata,
		Item,
		Outcome,
		Participant,
		Rune,
		SlottedRune,
		TeamMetadata,
		TeamStats,
		WindowFrame
	} from '../types';
	import DragonIcon from './DragonIcon.svelte';
	import GameSelector from './GameSelector.svelte';
	import ItemsDisplay from './ItemsDisplay.svelte';
	import MiniHealthBar from './MiniHealthBar.svelte';
	import ObjectiveStats from './ObjectiveStats.svelte';
	import StreamPicker from './StreamPicker.svelte';

	type Props = {
		eventDetails: EventDetails;
		matchId: string;
		gameIndex: number;
		gameMetadata: GameMetadata;
		firstWindowFrame: WindowFrame;
		/** Absent while the live feed has not produced a frame yet. */
		lastWindowFrame?: WindowFrame;
		/** Absent when the details feed is unavailable; stats then fall back to the first frame. */
		lastDetailsFrame?: DetailsFrame;
		outcome?: Outcome[];
		items?: Record<string, Item>;
		runes?: Rune[];
	};

	let {
		eventDetails,
		matchId,
		gameIndex,
		gameMetadata,
		firstWindowFrame,
		lastWindowFrame,
		lastDetailsFrame,
		outcome,
		items,
		runes
	}: Props = $props();

	const detailsEnabled = $derived(lastDetailsFrame !== undefined);
	// Without live frames the scoreboard shows the opening frame only.
	const frame = $derived(lastWindowFrame ?? firstWindowFrame);
	const gameState = $derived(gameStateLabel(frame.gameState));
	const goldPercentage = $derived(
		getGoldPercentage(frame.blueTeam.totalGold, frame.redTeam.totalGold)
	);
	const inGameTime = $derived(
		getInGameTime(firstWindowFrame.rfc460Timestamp, frame.rfc460Timestamp)
	);
	const formattedPatchVersion = $derived(getFormattedPatchVersion(gameMetadata.patchVersion));
	const championsUrl = $derived(CHAMPIONS_URL.replace('PATCH_VERSION', formattedPatchVersion));

	/**
	 * Some leagues (TCL) report the teams on the wrong side. Fall back to the
	 * summoner name prefix, then to the esports team id.
	 */
	const teams = $derived.by(() => {
		const first = eventDetails.match.teams[0];
		const second = eventDetails.match.teams[1];
		const summonerName =
			gameMetadata.blueTeamMetadata.participantMetadata[0].summonerName.split(' ');
		const swap =
			(summonerName[0] && second.code?.startsWith(summonerName[0])) ||
			gameMetadata.blueTeamMetadata.esportsTeamId !== first.id;
		return swap ? { blue: second, red: first } : { blue: first, red: second };
	});

	let expanded = $state<Record<string, boolean>>({});
	const rowKey = (side: string, index: number) => `${side}_${index}`;
	const toggleRow = (key: string) => (expanded[key] = !expanded[key]);

	function copyChampionNames() {
		const names = [
			...gameMetadata.blueTeamMetadata.participantMetadata.map((p) => p.championId),
			...gameMetadata.redTeamMetadata.participantMetadata.map((p) => p.championId)
		];
		navigator.clipboard.writeText(names.join('\t'));
	}

	function mappedRunes(details: Participant, allRunes: Rune[]): Array<SlottedRune | undefined> {
		const slotted: SlottedRune[] = [];
		for (const rune of allRunes) {
			for (const slot of rune.slots) {
				slotted.push(...slot.runes);
			}
		}
		return details.perkMetadata.perks.map((perk) => slotted.find((rune) => rune.id === perk));
	}
</script>

{#snippet runeList(details: Participant, allRunes: Rune[])}
	<div class="rune-list">
		{#each mappedRunes(details, allRunes) as rune}
			{#if rune}
				<div class="rune">
					<div>
						<img
							class="image"
							src="https://ddragon.leagueoflegends.com/cdn/img/{rune.icon}"
							alt=""
						/>
						<div class="name">{rune.name}</div>
					</div>
					<div class="text">
						<!-- Rune descriptions are Riot-authored HTML fragments. -->
						<div class="description">{@html rune.longDesc}</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
{/snippet}

{#snippet championStats(details: Participant, allRunes: Rune[])}
	<div>
		<div class="footer-notes">Attack Damage: {details.attackDamage}</div>
		<div class="footer-notes">Ability Power: {details.abilityPower}</div>
		<div class="footer-notes">Attack Speed: {details.attackSpeed}</div>
		<div class="footer-notes">Life Steal: {details.lifeSteal}%</div>
		<div class="footer-notes">Armor: {details.armor}</div>
		<div class="footer-notes">Magic Resistance: {details.magicResistance}</div>
		<div class="footer-notes">Wards Destroyed: {details.wardsDestroyed}</div>
		<div class="footer-notes">Wards Placed: {details.wardsPlaced}</div>
		<div class="footer-notes">
			Damage Share: {Math.round(details.championDamageShare * 10000) / 100}%
		</div>
		<div class="footer-notes">
			Kill Participation: {Math.round(details.killParticipation * 10000) / 100}%
		</div>
		<div class="footer-notes">Skill Order: {details.abilities.join('->')}</div>
		{@render runeList(details, allRunes)}
	</div>
{/snippet}

{#snippet playerTable(
	side: 'blue' | 'red',
	stats: TeamStats,
	metadata: TeamMetadata,
	metadataOffset: number,
	detailsOffset: number
)}
	<table class="status-live-game-card-table">
		<thead>
			<tr>
				<th class="table-top-row-champion" title="champion/team">
					<span>{(side === 'blue' ? teams.blue.name : teams.red.name).toUpperCase()}</span>
				</th>
				<th class="table-top-row-vida" title="life"><span>Health</span></th>
				<th class="table-top-row-items" title="items"><span>Items</span></th>
				<th class="table-top-row" title="creep score"><span>CS</span></th>
				<th class="table-top-row player-stats-kda" title="kills"><span>K</span></th>
				<th class="table-top-row player-stats-kda" title="deaths"><span>D</span></th>
				<th class="table-top-row player-stats-kda" title="assists"><span>A</span></th>
				<th class="table-top-row" title="gold"><span>Gold</span></th>
				<th class="table-top-row" title="gold difference"><span>+/-</span></th>
			</tr>
		</thead>
		<tbody>
			{#each stats.participants as player, index (player.participantId)}
				{@const gold = getGoldDifference(player, frame)}
				{@const champion = metadata.participantMetadata[player.participantId - metadataOffset]}
				{@const key = rowKey(side, index)}
				<tr class="player-stats-row">
					<th onclick={() => toggleRow(key)}>
						<div class="player-champion-info">
							<svg
								class="chevron-down"
								class:rotated={expanded[key]}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
							>
								<path
									d="M256 429.3l22.6-22.6 192-192L493.3 192 448 146.7l-22.6 22.6L256 338.7 86.6 169.4 64 146.7 18.7 192l22.6 22.6 192 192L256 429.3z"
								/>
							</svg>
							<div class="player-champion-wrapper">
								<img
									src="{championsUrl}{champion?.championId}.png"
									alt=""
									class="player-champion"
									onerror={(event) =>
										((event.currentTarget as HTMLElement).style.display = 'none')}
								/>
								<TeamTbd class="player-champion" />
							</div>
							<span class="player-champion-info-level">{player.level}</span>
							<div class="player-champion-info-name">
								<span>{champion?.championId}</span>
								<span class="player-card-player-name">{champion?.summonerName}</span>
							</div>
						</div>
					</th>
					<td>
						<MiniHealthBar
							currentHealth={player.currentHealth}
							maxHealth={player.maxHealth}
						/>
					</td>
					<td>
						{#if lastDetailsFrame && items}
							<ItemsDisplay
								participantId={player.participantId - 1}
								lastFrame={lastDetailsFrame}
								{items}
								patchVersion={formattedPatchVersion}
							/>
						{/if}
					</td>
					<td><div class=" player-stats">{player.creepScore}</div></td>
					<td><div class=" player-stats player-stats-kda">{player.kills}</div></td>
					<td><div class=" player-stats player-stats-kda">{player.deaths}</div></td>
					<td><div class=" player-stats player-stats-kda">{player.assists}</div></td>
					<td>
						<div class=" player-stats">{Number(player.totalGold).toLocaleString('en-us')}</div>
					</td>
					<td><div class="player-stats player-gold-{gold.style}">{gold.goldDifference}</div></td>
				</tr>
				<tr class="champion-stats-row">
					<td colspan={9}>
						<span class:expanded={expanded[key]}>
							{#if lastDetailsFrame && runes}
								{@render championStats(
									lastDetailsFrame.participants[index + detailsOffset],
									runes
								)}
							{/if}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/snippet}

{#snippet teamCard(side: 'blue' | 'red', index: 0 | 1)}
	{@const team = side === 'blue' ? teams.blue : teams.red}
	<div class="live-game-card-team">
		{#if team.code === 'TBD'}
			<TeamTbd class="live-game-card-team-image" />
		{:else}
			<img class="live-game-card-team-image" src={team.image} alt={team.name} />
		{/if}
		<span>
			<span class="team-name">{team.name}</span>
		</span>
		<span class="outcome">
			{#if outcome}
				<p class={outcome[index].outcome}>{outcome[index].outcome}</p>
			{/if}
		</span>
	</div>
{/snippet}

<div class="status-live-game-card">
	<GameSelector {eventDetails} {gameIndex} {matchId} />
	<div class="status-live-game-card-content">
		<div class="live-game-stats-header">
			<div class="live-game-stats-header-team-images">
				{@render teamCard('blue', 0)}
				<h1>
					{#if detailsEnabled}
						<div class="gamestate-bg-{gameState.split(' ').join('-')}">
							{gameState.toUpperCase()}
						</div>
					{:else}
						<div class="gamestate-bg-game-disabled">STATS TEMPORARILY DISABLED</div>
					{/if}
					<div>{inGameTime}</div>
				</h1>
				{@render teamCard('red', 1)}
			</div>
			<div class="live-game-stats-header-status">
				<ObjectiveStats teamStats={frame.blueTeam} teamColor="blue-team" />
				<ObjectiveStats teamStats={frame.redTeam} teamColor="red-team" />
			</div>
			<div class="live-game-stats-header-gold">
				<div class="blue-team" style="flex: {goldPercentage.goldBluePercentage}"></div>
				<div class="red-team" style="flex: {goldPercentage.goldRedPercentage}"></div>
			</div>
			<div class="live-game-stats-header-dragons">
				<div class="blue-team">
					{#each frame.blueTeam.dragons as dragon, i (i)}
						<DragonIcon dragonName={dragon} />
					{/each}
				</div>
				<div class="red-team">
					{#each frame.redTeam.dragons.slice().reverse() as dragon, i (i)}
						<DragonIcon dragonName={dragon} />
					{/each}
				</div>
			</div>
		</div>
		<div class="status-live-game-card-table-wrapper">
			{@render playerTable('blue', frame.blueTeam, gameMetadata.blueTeamMetadata, 1, 0)}
			{@render playerTable('red', frame.redTeam, gameMetadata.redTeamMetadata, 6, 5)}
		</div>
		<span class="footer-notes">
			<a
				target="_blank"
				rel="noopener noreferrer"
				href={patchNotesUrl(gameMetadata.patchVersion)}
			>
				Patch Version: {gameMetadata.patchVersion}
			</a>
		</span>
		<span class="footer-notes">
			<button type="button" class="copy-champion-names" onclick={copyChampionNames}>
				Copy Champion Names
			</button>
		</span>
		<StreamPicker {eventDetails} {gameIndex} />
	</div>
</div>
