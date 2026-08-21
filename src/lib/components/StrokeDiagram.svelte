<script lang="ts">
	import { onMount, tick } from 'svelte';

	let { strokes, maxWidth = '220px' }: { strokes: string[]; maxWidth?: string } = $props();

	let svgEl: SVGSVGElement | null = $state(null);
	let lens = $state<number[]>([]);
	let drawn = $state(false);
	let speedIdx = $state(1);
	let playToken = $state(0);
	let loop = $state(true);

	let loopTimer: ReturnType<typeof setTimeout> | undefined;

	const speeds = [0.5, 1, 2] as const;
	const BASE_MS_PER_UNIT = 3;
	const GAP_MS = 120;
	const LOOP_PAUSE_MS = 800;

	const measured = $derived(lens.length === strokes.length && strokes.length > 0);

	const schedule = $derived.by(() => {
		const speed = speeds[speedIdx];
		let t = 200 / speed;
		return strokes.map((_, i) => {
			const dur = Math.max(((lens[i] ?? 0) * BASE_MS_PER_UNIT) / speed, 150);
			const delay = t;
			t += dur * 0.6 + GAP_MS / speed;
			return { delay, dur };
		});
	});

	function scheduleNextLoop() {
		clearTimeout(loopTimer);
		if (!loop) return;
		const last = schedule[schedule.length - 1];
		if (!last) return;
		loopTimer = setTimeout(() => {
			if (loop) play();
		}, last.delay + last.dur + LOOP_PAUSE_MS);
	}

	async function play() {
		clearTimeout(loopTimer);
		drawn = false;
		playToken++;
		await tick();
		if (!svgEl) return;
		lens = Array.from(svgEl.querySelectorAll<SVGPathElement>('.stroke')).map((p) =>
			p.getTotalLength()
		);
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		drawn = true;
		scheduleNextLoop();
	}

	function toggleLoop() {
		loop = !loop;
		clearTimeout(loopTimer);
		if (loop && drawn) play();
	}

	function setSpeed(i: number) {
		if (speedIdx === i) return;
		speedIdx = i;
		play();
	}

	onMount(() => {
		play();
		return () => clearTimeout(loopTimer);
	});
</script>

<div class="diagram">
	<svg bind:this={svgEl} viewBox="-2 -2 113 113" aria-label="Stroke order diagram" style:max-width={maxWidth}>
		{#each strokes as d (d)}
			<path class="ghost" {d} />
		{/each}
		{#each strokes as d, i (playToken + '-' + i)}
			<path
				class="stroke"
				class:ready={measured}
				{d}
				style:stroke-dasharray={`${lens[i] ?? 1} ${lens[i] ?? 1}`}
				style:stroke-dashoffset={drawn ? 0 : (lens[i] ?? 1)}
				style:transition={drawn
					? `stroke-dashoffset ${schedule[i].dur}ms linear ${schedule[i].delay}ms`
					: 'none'}
			/>
		{/each}
	</svg>

	<div class="controls">
		<button class:looping={loop} onclick={() => toggleLoop()} aria-label="Toggle looping animation">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="17 1 21 5 17 9" />
				<path d="M3 11V9a4 4 0 0 1 4-4h14" />
				<polyline points="7 23 3 19 7 15" />
				<path d="M21 13v2a4 4 0 0 1-4 4H3" />
			</svg>
			<span>Loop</span>
		</button>
		<div class="speeds">
			{#each speeds as s, i}
				<button class:speed={speedIdx === i} onclick={() => setSpeed(i)}>{s}x</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.diagram {
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: center;
	}

	svg {
		width: 100%;
		max-width: 220px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	path {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.ghost {
		stroke: var(--border);
		stroke-width: 3;
	}

	.stroke {
		stroke: var(--accent);
		stroke-width: 3;
		filter: drop-shadow(0 0 4px var(--accent-glow));
		opacity: 0;
	}

	.stroke.ready {
		opacity: 1;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 0.85rem;
		cursor: pointer;
		transition: border-color 0.2s ease, color 0.2s ease;
	}

	button:hover {
		background: var(--bg-tertiary);
	}

	button.looping {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-dim);
	}

	.speeds {
		display: flex;
		gap: 4px;
	}

	.speeds button {
		padding: 6px 10px;
	}

	.speeds .speed {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-dim);
	}
</style>
