<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		CHAMPIONS_URL,
		ITEMS_JSON_URL,
		RUNES_JSON_URL,
		getDataDragonJson,
		getDetails,
		getEventDetails,
		getFormattedPatchVersion,
		getISODateMultiplyOf10,
		getSchedule,
		getStandings,
		getWindow
	} from '$lib/esports/api';
	import GameSelector from '$lib/esports/components/GameSelector.svelte';
	import LiveGame from '$lib/esports/components/LiveGame.svelte';
	import LiveWatcher from '$lib/esports/components/LiveWatcher.svelte';
	import MatchHeader from '$lib/esports/components/MatchHeader.svelte';
	import StreamPicker from '$lib/esports/components/StreamPicker.svelte';
	import {
		formatMatchState,
		gameStateIcon,
		getNextUnstartedGameIndex,
		patchNotesUrl
	} from '$lib/esports/format';
	import TeamTbd from '$lib/esports/icons/team-tbd.svelte';
	import type {
		DetailsFrame,
		EventDetails,
		GameMetadata,
		Item,
		Outcome,
		Record as TeamRecord,
		Result,
		Rune,
		ScheduleEvent,
		WindowFrame
	} from '$lib/esports/types';

	// Query params are not readable while prerendering, so the shell renders
	// without them and the client fills in the match after hydration.
	const matchId = $derived(browser ? (page.url.searchParams.get('game') ?? '') : '');

	// Distinguishes "not loaded yet" from "loaded, and there is no match".
	let started = $state(false);

	let eventDetails = $state<EventDetails>();
	let firstWindowFrame = $state<WindowFrame>();
	let lastWindowFrame = $state<WindowFrame>();
	let lastDetailsFrame = $state<DetailsFrame>();
	let metadata = $state<GameMetadata>();
	let records = $state<TeamRecord[]>();
	let results = $state<Result[]>();
	let currentGameOutcome = $state<Outcome[]>();
	let scheduleEvent = $state<ScheduleEvent>();
	let gameIndex = $state<number>();
	let items = $state<Record<string, Item>>();
	let runes = $state<Rune[]>();

	// Poll bookkeeping. Deliberately not reactive: none of it is rendered.
	let polledEventDetails: EventDetails | undefined;
	let currentGameIndex = 1;
	let lastFrameSuccess = false;
	let currentTimestamp = '';
	let firstWindowReceived = false;

	/** The URL wins when `?g=` is set; otherwise follow the next unstarted game. */
	function resolveGameIndex(details: EventDetails): number {
		const fromUrl = Number(page.url.searchParams.get('g')) || 0;
		return fromUrl || getNextUnstartedGameIndex(details);
	}

	function loadFirstWindow(gameId: string) {
		getWindow(gameId).then((window) => {
			const frames = window?.frames;
			if (!frames || !window) return;
			firstWindowReceived = true;
			metadata = window.gameMetadata;
			firstWindowFrame = frames[0];
			loadItems(window.gameMetadata);
			loadRunes(window.gameMetadata);
		});
	}

	function loadLiveWindow(gameId: string) {
		getWindow(gameId, getISODateMultiplyOf10()).then((window) => {
			const frames = window?.frames;
			if (!frames || !window) return;
			const frame = frames[frames.length - 1];
			if (currentTimestamp > frame.rfc460Timestamp) return;
			currentTimestamp = frame.rfc460Timestamp;

			lastWindowFrame = frame;
			metadata = window.gameMetadata;
			computeOutcome(frame);
		});
	}

	function loadDetailsFrame(gameId: string) {
		getDetails(gameId, getISODateMultiplyOf10(), lastFrameSuccess).then((response) => {
			lastFrameSuccess = false;
			const frames = response?.frames;
			if (!frames) return;
			lastFrameSuccess = true;
			lastDetailsFrame = frames[frames.length - 1];
		});
	}

	/**
	 * A game can end before the API records an outcome, so infer the winner from
	 * the series state, the objective counts, and the series result.
	 */
	function computeOutcome(frame: WindowFrame) {
		const details = polledEventDetails;
		if (!details) return;
		const game = details.match.games[currentGameIndex - 1];
		if (!game) return;

		const homeTeam = details.match.teams[0];
		const awayTeam = details.match.teams[1];
		const cleanSweep =
			game.state === 'completed' &&
			(details.match.teams[0].result.gameWins === 0 || details.match.teams[1].result.gameWins === 0);

		const blueTeam = game.teams[0].id === homeTeam.id ? homeTeam : awayTeam;
		const redTeam = game.teams[1].id === homeTeam.id ? homeTeam : awayTeam;

		const allGamesDecided = details.match.games.every(
			(candidate) => candidate.state === 'completed' || candidate.state === 'unneeded'
		);
		const blueTeamWonMatch = allGamesDecided && blueTeam.result.gameWins > redTeam.result.gameWins;
		const redTeamWonMatch = allGamesDecided && redTeam.result.gameWins > blueTeam.result.gameWins;

		const blueTeamWonOnInhibitors =
			frame.blueTeam.inhibitors > 0 && frame.redTeam.inhibitors === 0;
		const redTeamWonOnInhibitors =
			frame.redTeam.inhibitors > 0 && frame.blueTeam.inhibitors === 0;

		const completedGames = details.match.games.filter(
			(candidate) => candidate.state === 'completed'
		).length;
		const isFinalGame = currentGameIndex - 1 === completedGames;

		const blueTeamWon =
			game.state === 'completed' &&
			(blueTeam.result.outcome === 'win' ||
				(cleanSweep && blueTeam.result.gameWins > 0) ||
				blueTeamWonOnInhibitors ||
				(blueTeamWonMatch && isFinalGame));
		const redTeamWon =
			game.state === 'completed' &&
			(redTeam.result.outcome === 'win' ||
				(cleanSweep && redTeam.result.gameWins > 0) ||
				redTeamWonOnInhibitors ||
				(redTeamWonMatch && isFinalGame));

		currentGameOutcome = [
			{ outcome: blueTeamWon ? 'win' : redTeamWon ? 'loss' : undefined },
			{ outcome: redTeamWon ? 'win' : blueTeamWon ? 'loss' : undefined }
		];
	}

	function loadScheduleEvent() {
		getSchedule().then((schedule) => {
			const found = schedule?.events.find((event) =>
				event.match ? event.match.id === matchId : false
			);
			if (!found?.match.teams[0].record || !found.match.teams[1].record) return;
			records = [found.match.teams[0].record, found.match.teams[1].record];
			scheduleEvent = found;
		});
	}

	function loadResults(details: EventDetails) {
		getStandings(details.tournament.id).then((standings) => {
			if (!standings) return;
			for (const stage of standings[0]?.stages ?? []) {
				const section = stage.sections.find((candidate) =>
					candidate.matches.find((match) => match.id === matchId)
				);
				const found = section?.matches.find((match) => match.id === matchId);
				if (found) {
					results = found.teams.map((team) => team.result);
					return;
				}
			}
		});
	}

	function loadItems(gameMetadata: GameMetadata) {
		getDataDragonJson(ITEMS_JSON_URL, getFormattedPatchVersion(gameMetadata.patchVersion))
			.then((body) => (items = body.data))
			.catch((error) => console.error(error));
	}

	function loadRunes(gameMetadata: GameMetadata) {
		getDataDragonJson(RUNES_JSON_URL, getFormattedPatchVersion(gameMetadata.patchVersion))
			.then((body) => (runes = body))
			.catch((error) => console.error(error));
	}

	function loadEventDetails(initialGameIndex: number) {
		getEventDetails(matchId).then((details) => {
			if (!details) return;
			const resolvedIndex = resolveGameIndex(details);
			const game = details.match.games[resolvedIndex - 1];
			if (!game) return;

			eventDetails = details;
			polledEventDetails = details;
			gameIndex = resolvedIndex;
			currentGameIndex = resolvedIndex;
			loadFirstWindow(game.id);
			loadScheduleEvent();
			loadResults(details);
		});
	}

	function tick() {
		const details = polledEventDetails;
		if (!details) return;
		const nextIndex = resolveGameIndex(details);
		const game = details.match.games[nextIndex - 1];
		if (!game) return;

		// Reset the window cursor when the game changes or the first frame lands.
		if (currentGameIndex !== nextIndex || !firstWindowReceived) {
			currentTimestamp = '';
			loadFirstWindow(game.id);
			gameIndex = nextIndex;
			currentGameIndex = nextIndex;
		}

		loadLiveWindow(game.id);
		loadDetailsFrame(game.id);
	}

	onMount(() => {
		started = true;
		if (!matchId) return;
		loadEventDetails(Number(page.url.searchParams.get('g')) || 0);
		const intervalId = setInterval(tick, 500);
		return () => clearInterval(intervalId);
	});

	const stateFrame = $derived(lastWindowFrame ?? firstWindowFrame);

	/**
	 * Bundled views so the template can narrow every optional value at once.
	 * A `$derived` boolean cannot narrow separate `$state` variables.
	 */
	const loadedView = $derived.by(() => {
		const details = eventDetails;
		const first = firstWindowFrame;
		const last = lastWindowFrame;
		const detailsFrame = lastDetailsFrame;
		const meta = metadata;
		const outcome = currentGameOutcome;
		const schedule = scheduleEvent;
		const index = gameIndex;
		const itemMap = items;
		const runeList = runes;
		if (
			!details ||
			!first ||
			!last ||
			!detailsFrame ||
			!meta ||
			!outcome ||
			index === undefined ||
			!itemMap ||
			!runeList
		) {
			return undefined;
		}
		return {
			eventDetails: details,
			firstWindowFrame: first,
			lastWindowFrame: last,
			lastDetailsFrame: detailsFrame,
			gameMetadata: meta,
			outcome,
			gameIndex: index,
			items: itemMap,
			runes: runeList
		};
	});

	/** The details feed lags the window feed, so stats render without it first. */
	const partialView = $derived.by(() => {
		const details = eventDetails;
		const first = firstWindowFrame;
		const meta = metadata;
		const index = gameIndex;
		if (!details || !first || !meta || index === undefined) return undefined;
		return {
			eventDetails: details,
			firstWindowFrame: first,
			gameMetadata: meta,
			gameIndex: index
		};
	});
	const title = $derived.by(() => {
		if (!eventDetails) return 'Esports | 0xfinder';
		const icon = stateFrame ? gameStateIcon(stateFrame.gameState) : '🟡';
		const [home, away] = eventDetails.match.teams;
		return `${icon} ${eventDetails.league.name} - ${home.name} vs. ${away.name}`;
	});

	const championsUrlWithPatchVersion = $derived(
		metadata
			? CHAMPIONS_URL.replace('PATCH_VERSION', getFormattedPatchVersion(metadata.patchVersion))
			: ''
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

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if started && !matchId}
	<div class="esports-message">
		<h1>No match selected</h1>
		<p>Pick a match from the <a href="/esports">schedule</a>.</p>
	</div>
{:else if loadedView}
	<MatchHeader
		eventDetails={loadedView.eventDetails}
		matchState={formatMatchState(
			loadedView.eventDetails,
			loadedView.lastWindowFrame,
			scheduleEvent
		)}
		{records}
		{results}
		{scheduleEvent}
	/>
	<LiveGame
		eventDetails={loadedView.eventDetails}
		{matchId}
		gameIndex={loadedView.gameIndex}
		gameMetadata={loadedView.gameMetadata}
		firstWindowFrame={loadedView.firstWindowFrame}
		lastWindowFrame={loadedView.lastWindowFrame}
		lastDetailsFrame={loadedView.lastDetailsFrame}
		outcome={loadedView.outcome}
		items={loadedView.items}
		runes={loadedView.runes}
	/>
	<LiveWatcher
		lastWindowFrame={loadedView.lastWindowFrame}
		gameIndex={loadedView.gameIndex}
		gameMetadata={loadedView.gameMetadata}
		{championsUrlWithPatchVersion}
		blueTeam={loadedView.eventDetails.match.teams[0]}
		redTeam={loadedView.eventDetails.match.teams[1]}
	/>
{:else if partialView}
	<MatchHeader
		eventDetails={partialView.eventDetails}
		matchState={formatMatchState(
			partialView.eventDetails,
			partialView.firstWindowFrame,
			scheduleEvent
		)}
		{records}
		{results}
		{scheduleEvent}
	/>
	<LiveGame
		eventDetails={partialView.eventDetails}
		{matchId}
		gameIndex={partialView.gameIndex}
		gameMetadata={partialView.gameMetadata}
		firstWindowFrame={partialView.firstWindowFrame}
	/>
	<LiveWatcher
		lastWindowFrame={partialView.firstWindowFrame}
		gameIndex={partialView.gameIndex}
		gameMetadata={partialView.gameMetadata}
		{championsUrlWithPatchVersion}
		blueTeam={partialView.eventDetails.match.teams[0]}
		redTeam={partialView.eventDetails.match.teams[1]}
	/>
{:else if eventDetails}
	<div class="loading-game-container">
		<div>
			<h3>{eventDetails.league.name}</h3>
			<div class="live-game-card-content">
				{#each [0, 1] as index (index)}
					{#if index === 1}
						<div class="game-card-versus">
							<span>BEST OF {eventDetails.match.strategy.count}</span>
							{#if eventDetails.match.teams[0].result && eventDetails.match.teams[1].result}
								<span>
									<p>
										{eventDetails.match.teams[0].result.gameWins} -
										{eventDetails.match.teams[1].result.gameWins}
									</p>
								</span>
							{/if}
							<h1>VS</h1>
						</div>
					{/if}
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
						<span class="live-game-card-title">
							<span>
								<h4>{eventDetails.match.teams[index].name}</h4>
							</span>
							{#if currentGameOutcome}
								<span class="outcome">
									<p class={currentGameOutcome[index].outcome}>
										{currentGameOutcome[index].outcome}
									</p>
								</span>
							{/if}
							{#if records}
								<span>
									<p>{records[index].wins} - {records[index].losses}</p>
								</span>
							{/if}
						</span>
					</div>
				{/each}
			</div>
			{#if scheduleEvent}
				<h3>
					Game {getNextUnstartedGameIndex(eventDetails)} out of
					{eventDetails.match.strategy.count} will start at
					{formatTime(scheduleEvent.startTime)}
				</h3>
			{/if}
			<img class="loading-game-image" alt="game loading" src="/esports/loading.svg" />
		</div>
	</div>
	<div class="status-live-game-card">
		<GameSelector {eventDetails} gameIndex={gameIndex ?? 0} {matchId} />
		<div class="status-live-game-card-content">
			{#if metadata}
				<div>
					<span class="footer-notes">
						<a
							target="_blank"
							rel="noopener noreferrer"
							href={patchNotesUrl(metadata.patchVersion)}
						>
							Patch Version: {metadata.patchVersion}
						</a>
					</span>
				</div>
			{/if}
			<StreamPicker {eventDetails} gameIndex={gameIndex ?? 0} />
		</div>
	</div>
{:else}
	<div class="loading-game-container">
		<div>
			<img class="loading-game-image" alt="game loading" src="/esports/loading.svg" />
		</div>
	</div>
{/if}

<style>
	.esports-message {
		padding: 64px 0;
		text-align: center;
	}

	.esports-message h1 {
		font-size: 1.75rem;
		margin-bottom: 8px;
	}

	.esports-message p {
		color: var(--text-secondary);
	}
</style>
