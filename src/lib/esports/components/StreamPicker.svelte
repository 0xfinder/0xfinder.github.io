<script lang="ts">
	import { capitalizeFirstLetter } from '../format';
	import { prefs } from '../prefs.svelte';
	import type { EventDetails, ExtendedVod } from '../types';
	import Toggle from './Toggle.svelte';

	type Props = {
		eventDetails: EventDetails;
		gameIndex: number;
	};

	let { eventDetails, gameIndex }: Props = $props();

	const coStreamer = (
		parameter: string,
		provider: ExtendedVod['provider'],
		locale: string,
		englishName: string
	): ExtendedVod => ({
		coStreamer: true,
		offset: 0,
		parameter,
		provider,
		locale,
		mediaLocale: { englishName, translatedName: englishName, locale }
	});

	// Streams the esports API does not list, offered as extra viewing options.
	const CO_STREAMERS: ExtendedVod[] = [
		coStreamer('caedrel', 'twitch', 'en-US', 'Caedrel'),
		coStreamer('doublelift', 'twitch', 'en-US', 'Doublelift'),
		coStreamer('ibai', 'twitch', 'en-ES', 'Ibai'),
		coStreamer('initialisecasts', 'twitch', 'en-US', 'Initiliase'),
		coStreamer('iwdominate', 'twitch', 'en-US', 'IWillDominate'),
		coStreamer('lpl', 'huya', 'en-CN', 'LPL - Huya'),
		coStreamer('imls', 'twitch', 'en-US', 'LS'),
		coStreamer('nymaera_', 'twitch', 'en-US', 'Nymaera'),
		coStreamer('loltyler1', 'twitch', 'en-US', 'Tyler1'),
		coStreamer('yamatocannon', 'twitch', 'en-US', 'YamatoCannon')
	];

	const sortStreams = (a: ExtendedVod, b: ExtendedVod) => {
		if (!a.coStreamer && a.mediaLocale.locale.includes('en-')) {
			if (a.provider === 'youtube' && !b.coStreamer && b.mediaLocale.locale.includes('en-')) return 1;
			return -1;
		}
		if (b.coStreamer) return b.offset - a.offset;
		return 1;
	};

	const picker = $derived.by(() => {
		const game = eventDetails.match.games[gameIndex - 1];
		const vods = game?.vods ?? [];
		if (vods.length) return { vods: true, streams: vods, unavailable: false };

		const provided = eventDetails.streams ?? [];
		if (!provided.length && game?.state === 'completed') {
			return { vods: false, streams: [] as ExtendedVod[], unavailable: true };
		}

		// Copy before sorting: `eventDetails` is live state and must not be mutated.
		const streams = [...provided].sort(sortStreams);
		for (const streamer of CO_STREAMERS) {
			if (!streams.some((stream) => stream.parameter === streamer.parameter)) streams.push(streamer);
		}
		return { vods: false, streams, unavailable: false };
	});

	let override = $state<{ gameIndex: number; provider: string; parameter: string } | null>(null);

	// Fall back to the first stream, and drop an override that no longer exists
	// (the list changes as games start and finish).
	const selected = $derived.by(() => {
		const list = picker.streams;
		const current = override;
		if (
			current &&
			current.gameIndex === gameIndex &&
			list.some((stream) => stream.parameter === current.parameter)
		) {
			return current;
		}
		const first = list[0];
		return first ? { gameIndex, provider: first.provider, parameter: first.parameter } : null;
	});

	function streamLabel(stream: ExtendedVod): string {
		const streamOffset = Math.round((stream.offset / 1000 / 60) * -1);
		const delayString = streamOffset > 1 ? `~${streamOffset} minutes` : '<1 minute';
		if (picker.vods) return `VOD: ${capitalizeFirstLetter(stream.provider)}(${stream.locale})`;
		if (stream.coStreamer) return stream.mediaLocale.englishName;
		const provider = capitalizeFirstLetter(stream.provider);
		return stream.provider === 'twitch'
			? `${provider}(${stream.locale}) - ${stream.parameter} - Delay: ${delayString}`
			: `${provider}(${stream.locale}) - Delay: ${delayString}`;
	}

	function selectStream(event: Event) {
		const parameter = (event.currentTarget as HTMLSelectElement).value;
		const stream = picker.streams.find((candidate) => candidate.parameter === parameter);
		if (stream) override = { gameIndex, provider: stream.provider, parameter: stream.parameter };
	}

	// Twitch has no iframe-only embed; its JS builds the player inside a container.
	let twitchContainer: HTMLDivElement | undefined = $state();
	let twitchScript: Promise<void> | undefined;

	function loadTwitchScript(): Promise<void> {
		twitchScript ??= new Promise<void>((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://player.twitch.tv/js/embed/v1.js';
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Failed to load the Twitch embed script'));
			document.head.appendChild(script);
		});
		return twitchScript;
	}

	$effect(() => {
		const stream = selected;
		const container = twitchContainer;
		const withChat = prefs.chat;
		if (!container || !stream || stream.provider !== 'twitch') return;

		let cancelled = false;
		loadTwitchScript()
			.then(() => {
				if (cancelled) return;
				container.innerHTML = '';
				const Twitch = (window as unknown as { Twitch?: any }).Twitch;
				if (!Twitch) return;
				new Twitch.Player(container.id, {
					width: '100%',
					height: '100%',
					channel: stream.parameter,
					parent: [window.location.hostname],
					layout: withChat ? 'video-with-chat' : 'video'
				});
			})
			.catch(() => {
				/* Embed is best-effort; the page still works without it. */
			});

		return () => {
			cancelled = true;
			container.innerHTML = '';
		};
	});

	const player = $derived(prefs.stream ? selected : null);
</script>

{#if picker.unavailable}
	<span class="footer-notes">No VODS currently available</span>
{:else}
	<select id="streamDropdown" class="footer-notes" value={selected?.parameter} onchange={selectStream}>
		{#each picker.streams as stream (stream.parameter)}
			<option value={stream.parameter}>{streamLabel(stream)}</option>
		{/each}
	</select>
{/if}

<div class="streamDiv">
	<span class="footer-notes">Stream Enabled:</span>
	<Toggle prefKey="stream" variant="stream-toggle" onGlyph="✅" offGlyph="❌" />
</div>
<div class="chatDiv">
	<span class="footer-notes">Chat Enabled:</span>
	<Toggle prefKey="chat" variant="chat-toggle" onGlyph="✅" offGlyph="❌" />
</div>
<div class="streamDiv">
	<span class="footer-notes">Sound Enabled:</span>
	<Toggle prefKey="sound" variant="sound-toggle" onGlyph="🔊" offGlyph="🔈" />
</div>

{#if player}
	<div id="video-player" class="added" class:chatEnabled={prefs.chat}>
		{#if player.provider === 'youtube'}
			<iframe
				width="100%"
				height="100%"
				src="https://www.youtube.com/embed/{player.parameter}?autoplay=1"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				title="Embedded youtube"
			></iframe>
			{#if prefs.chat}
				<iframe
					width="350px"
					height="500px"
					src="https://www.youtube.com/live_chat?v={player.parameter}"
					title="Embedded youtube chat"
				></iframe>
			{/if}
		{:else if player.provider === 'huya'}
			<iframe
				width="100%"
				height="100%"
				frameborder="0"
				scrolling="no"
				src="https://liveshare.huya.com/iframe/lpl"
				title="Embedded huya"
			></iframe>
		{:else if player.provider === 'afreecatv'}
			<iframe
				src="https://play.afreecatv.com/{player.parameter}"
				width="100%"
				height="100%"
				frameborder="0"
				allowfullscreen
				title="Embedded afreecatv"
			></iframe>
		{:else if player.provider === 'twitch'}
			<div id="twitch-embed" bind:this={twitchContainer}></div>
		{/if}
	</div>
{/if}
