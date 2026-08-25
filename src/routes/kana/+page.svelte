<script lang="ts">
	import { onMount } from 'svelte';
	import { kana, combos, type Kana, type Combo } from '$lib/data/kana';
	import StrokeDiagram from '$lib/components/StrokeDiagram.svelte';

	type Mode = 'browse' | 'quiz';
	type Script = 'h' | 'k' | 'c';
	type Entry = Kana | Combo;

	let visible = $state(false);
	let mode = $state<Mode>('browse');
	let script = $state<Script>('h');
	let selected = $state<Entry | null>(null);

	function isCombo(entry: Entry): entry is Combo {
		return 'glyphs' in entry;
	}

	const pool = $derived<Entry[]>(script === 'c' ? combos : kana.filter((k) => k.type === script));

	// Gojūon chart: vowel columns × consonant rows, plus dakuten rows.
	// Defined with hiragana; katakana is derived by codepoint shift (+0x60).
	interface ChartRow {
		label: string;
		cells: (Kana | null)[];
	}

	const HIRAGANA_CHART: { label: string; kana: (string | null)[] }[] = [
		{ label: '', kana: ['あ', 'い', 'う', 'え', 'お'] },
		{ label: 'k', kana: ['か', 'き', 'く', 'け', 'こ'] },
		{ label: 's', kana: ['さ', 'し', 'す', 'せ', 'そ'] },
		{ label: 't', kana: ['た', 'ち', 'つ', 'て', 'と'] },
		{ label: 'n', kana: ['な', 'に', 'ぬ', 'ね', 'の'] },
		{ label: 'h', kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
		{ label: 'm', kana: ['ま', 'み', 'む', 'め', 'も'] },
		{ label: 'y', kana: ['や', null, 'ゆ', null, 'よ'] },
		{ label: 'r', kana: ['ら', 'り', 'る', 'れ', 'ろ'] },
		{ label: 'w', kana: ['わ', 'ゐ', 'ゑ', 'を', null] },
		{ label: '', kana: ['ん', null, null, null, null] },
		{ label: 'g', kana: ['が', 'ぎ', 'ぐ', 'げ', 'ご'] },
		{ label: 'z', kana: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'] },
		{ label: 'd', kana: ['だ', 'ぢ', 'づ', 'で', 'ど'] },
		{ label: 'b', kana: ['ば', 'び', 'ぶ', 'べ', 'ぼ'] },
		{ label: 'p', kana: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'] },
		{ label: 'v', kana: ['ゔ', null, null, null, null] }
	];

	function chartRows(chars: Kana[]): ChartRow[] {
		const map = new Map(chars.map((k) => [k.char, k]));
		return HIRAGANA_CHART.map((row) => ({
			label: row.label,
			cells: row.kana.map((c) => {
				if (!c) return null;
				if (script === 'h') return map.get(c) ?? null;
				const kat = String.fromCodePoint(c.codePointAt(0)! + 0x60);
				return map.get(kat) ?? null;
			})
		}));
	}

	const rows = $derived(chartRows(pool as Kana[]));

	// Yōon chart: contraction rows × ya/yu/yo columns.
	const COMBO_CHART: { label: string; chars: [string, string, string] }[] = [
		{ label: 'k', chars: ['きゃ', 'きゅ', 'きょ'] },
		{ label: 's', chars: ['しゃ', 'しゅ', 'しょ'] },
		{ label: 'ch', chars: ['ちゃ', 'ちゅ', 'ちょ'] },
		{ label: 'n', chars: ['にゃ', 'にゅ', 'にょ'] },
		{ label: 'h', chars: ['ひゃ', 'ひゅ', 'ひょ'] },
		{ label: 'm', chars: ['みゃ', 'みゅ', 'みょ'] },
		{ label: 'r', chars: ['りゃ', 'りゅ', 'りょ'] },
		{ label: 'g', chars: ['ぎゃ', 'ぎゅ', 'ぎょ'] },
		{ label: 'j', chars: ['じゃ', 'じゅ', 'じょ'] },
		{ label: 'b', chars: ['びゃ', 'びゅ', 'びょ'] },
		{ label: 'p', chars: ['ぴゃ', 'ぴゅ', 'ぴょ'] }
	];

	interface ComboRow {
		label: string;
		cells: (Combo | null)[];
	}

	function comboRows(type: 'h' | 'k'): ComboRow[] {
		const map = new Map(combos.filter((c) => c.type === type).map((c) => [c.char, c]));
		return COMBO_CHART.map((row) => ({
			label: row.label,
			cells: row.chars.map((c) => {
				if (type === 'h') return map.get(c) ?? null;
				const kat = [...c].map((ch) => String.fromCodePoint(ch.codePointAt(0)! + 0x60)).join('');
				return map.get(kat) ?? null;
			})
		}));
	}

	const hiraganaComboRows = $derived(comboRows('h'));
	const katakanaComboRows = $derived(comboRows('k'));

	// Quiz state
	let quizKana = $state<Entry | null>(null);
	let choices = $state<Entry[]>([]);
	let answered = $state<Entry | null>(null);
	let score = $state({ correct: 0, total: 0 });
	let streak = $state(0);
	let bestStreak = $state(0);

	onMount(() => {
		visible = true;
	});

	function fadeCollapse(node: HTMLElement, { duration = 250 } = {}) {
		const height = node.offsetHeight;
		const marginBottom = parseFloat(getComputedStyle(node).marginBottom);
		return {
			duration,
			css: (t: number) =>
				`height: ${height * t}px; margin-bottom: ${marginBottom * t}px; opacity: ${t}; overflow: hidden;`
		};
	}

	function pickRandom(exclude?: Entry): Entry {
		let next = pool[Math.floor(Math.random() * pool.length)];
		while (pool.length > 1 && next === exclude) {
			next = pool[Math.floor(Math.random() * pool.length)];
		}
		return next;
	}

	function nextQuestion() {
		answered = null;
		const answer = pickRandom(quizKana ?? undefined);
		quizKana = answer;
		const distractors: Entry[] = [];
		while (distractors.length < 3) {
			const cand = pickRandom(answer);
			if (cand !== answer && !distractors.includes(cand) && cand.romaji !== answer.romaji) {
				distractors.push(cand);
			}
		}
		choices = [answer, ...distractors].sort(() => Math.random() - 0.5);
	}

	function startQuiz() {
		mode = 'quiz';
		selected = null;
		score = { correct: 0, total: 0 };
		streak = 0;
		bestStreak = 0;
		nextQuestion();
	}

	function answer(k: Entry) {
		if (answered) return;
		answered = k;
		score.total++;
		if (k.char === quizKana?.char) {
			score.correct++;
			streak++;
			bestStreak = Math.max(bestStreak, streak);
			setTimeout(() => {
				if (mode === 'quiz') nextQuestion();
			}, 700);
		} else {
			streak = 0;
		}
	}

	function setScript(s: Script) {
		script = s;
		selected = null;
		if (mode === 'quiz') nextQuestion();
	}
</script>

<svelte:head>
	<title>Kana Practice | 0xfinder</title>
</svelte:head>

<div class="kana" class:visible>
	<div class="header">
		<h1>Kana Practice</h1>
		<p class="subtitle">Hiragana, katakana &amp; yōon with animated stroke order.</p>
	</div>

	<div class="toolbar">
		<div class="tabs">
			<button class:active={script === 'h'} onclick={() => setScript('h')}>Hiragana</button>
			<button class:active={script === 'k'} onclick={() => setScript('k')}>Katakana</button>
			<button class:active={script === 'c'} onclick={() => setScript('c')}>Combined</button>
		</div>
		<button class="quiz-toggle" onclick={mode === 'quiz' ? () => (mode = 'browse') : startQuiz}>
			{mode === 'quiz' ? 'Exit quiz' : 'Start quiz'}
		</button>
	</div>

	{#if mode === 'quiz'}
		<div class="quiz">
			{#if quizKana}
				<div class="quiz-diagram">
					{#key quizKana.char}
						{#if isCombo(quizKana)}
							<StrokeDiagram
								strokes={[]}
								glyphs={quizKana.glyphs}
								viewBox="-2 -2 148 118"
								maxWidth="320px"
							/>
						{:else}
							<StrokeDiagram strokes={quizKana.strokes} maxWidth="320px" />
						{/if}
					{/key}
				</div>
				<p class="prompt">
					{#if answered}
						{#if answered.char === quizKana.char}
							<span class="correct">Correct! It's {quizKana.char} ({quizKana.romaji})</span>
						{:else}
							<span class="wrong">It's {quizKana.char} ({quizKana.romaji})</span>
						{/if}
					{:else}
						Which sound is this?
					{/if}
				</p>
				<div class="choices" data-answer={quizKana.romaji}>
					{#each choices as c (c.char)}
						<button
							class="choice"
							class:right={answered && answered.char === quizKana.char && c.char === quizKana.char}
							class:wrong={answered && answered.char === c.char && c.char !== quizKana.char}
							disabled={!!answered}
							onclick={() => answer(c)}
						>
							{c.romaji}
						</button>
					{/each}
				</div>
				{#if answered && answered.char !== quizKana.char}
					<button class="next" onclick={() => nextQuestion()}>Next →</button>
				{/if}
				<div class="score">
					<span>{score.correct}/{score.total}</span>
					<span>streak {streak}{bestStreak > 0 ? ` · best ${bestStreak}` : ''}</span>
				</div>
			{/if}
		</div>
	{:else}
		{#if selected}
			<div class="detail" transition:fadeCollapse>
				<button class="close" onclick={() => (selected = null)} aria-label="Close">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
				{#key selected.char}
					{#if isCombo(selected)}
						<StrokeDiagram
							strokes={[]}
							glyphs={selected.glyphs}
							viewBox="-2 -2 148 118"
						/>
					{:else}
						<StrokeDiagram strokes={selected.strokes} />
					{/if}
				{/key}
				<div class="detail-info">
					<span class="big-char">{selected.char}</span>
					<h2>{selected.romaji}</h2>
					<p>{selected.strokeCount} stroke{selected.strokeCount > 1 ? 's' : ''}</p>
				</div>
			</div>
		{/if}

		{#if script === 'c'}
			<section class="combo-section">
				<h3 class="section-title">Hiragana</h3>
				<div class="chart">
					{#each hiraganaComboRows as row, r}
						<div class="row combo">
							<span class="row-label">{row.label}</span>
							{#each row.cells as k, i (k ? k.char : `h-empty-${r}-${i}`)}
								{#if k}
									<button
										class="card"
										style="animation-delay: {Math.min((r * 3 + i) * 0.02, 0.6)}s"
										class:selected={selected?.char === k.char}
										onclick={() => (selected = k)}
									>
										<span class="char">{k.char}</span>
										<span class="romaji">{k.romaji}</span>
									</button>
								{:else}
									<span class="empty"></span>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
			</section>

			<section class="combo-section">
				<h3 class="section-title">Katakana</h3>
				<div class="chart">
					{#each katakanaComboRows as row, r}
						<div class="row combo">
							<span class="row-label">{row.label}</span>
							{#each row.cells as k, i (k ? k.char : `k-empty-${r}-${i}`)}
								{#if k}
									<button
										class="card"
										style="animation-delay: {Math.min((r * 3 + i) * 0.02 + 0.1, 0.7)}s"
										class:selected={selected?.char === k.char}
										onclick={() => (selected = k)}
									>
										<span class="char">{k.char}</span>
										<span class="romaji">{k.romaji}</span>
									</button>
								{:else}
									<span class="empty"></span>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
			</section>
		{:else}
			<div class="chart">
				{#each rows as row, r}
					<div class="row">
						<span class="row-label">{row.label}</span>
						{#each row.cells as k, i (k ? k.char : `empty-${r}-${i}`)}
							{#if k}
								<button
									class="card"
									style="animation-delay: {Math.min((r * 5 + i) * 0.02, 0.6)}s"
									class:selected={selected?.char === k.char}
									onclick={() => (selected = k)}
								>
									<span class="char">{k.char}</span>
									<span class="romaji">{k.romaji}</span>
								</button>
							{:else}
								<span class="empty"></span>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	<footer class="attribution">
		Stroke order data from
		<a href="https://github.com/KanjiVG/kanjivg" target="_blank" rel="noopener">KanjiVG</a>,
		licensed <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>.
	</footer>
</div>

<style>
	.kana {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.kana.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.kana {
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 180px);
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 8px;
	}

	.subtitle {
		color: var(--text-secondary);
		margin-bottom: 32px;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.tabs button,
	.quiz-toggle,
	.choices button {
		padding: 8px 16px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tabs {
		display: flex;
		gap: 8px;
	}

	.tabs button:not(.active):hover,
	.quiz-toggle:hover {
		background: var(--bg-tertiary);
	}

	.tabs .active {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: var(--accent);
	}

	.quiz-toggle {
		color: var(--text-primary);
	}

	.detail {
		position: relative;
		display: flex;
		gap: 24px;
		align-items: center;
		padding: 20px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 12px;
		margin-bottom: 24px;
	}

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px;
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		transition: color 0.2s ease;
	}

	.close:hover {
		color: var(--text-primary);
	}

	.detail-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.big-char {
		font-size: 2rem;
		color: var(--text-secondary);
	}

	.detail-info h2 {
		font-size: 1.5rem;
	}

	.detail-info p {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.chart {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.row {
		position: relative;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
	}

	.row.combo {
		grid-template-columns: repeat(3, minmax(0, 220px));
	}

	.combo-section {
		margin-bottom: 24px;
	}

	.combo-section + .combo-section {
		margin-top: 8px;
	}

	.section-title {
		font-size: 0.85rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin-bottom: 12px;
	}

	.row-label {
		position: absolute;
		right: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: lowercase;
	}

	.empty {
		border-radius: 10px;
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 4px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 10px;
		cursor: pointer;
		animation: fadeUp 0.4s ease backwards;
		transition: all 0.2s ease;
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}

	.card.selected {
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.char {
		font-size: 1.6rem;
		color: var(--text-primary);
		line-height: 1;
	}

	.row.combo .char {
		font-size: 1.4rem;
	}

	@media (max-width: 480px) {
		.char {
			font-size: 1.2rem;
		}

		.row-label {
			display: none;
		}

		.row {
			gap: 5px;
		}

		.card {
			padding: 8px 2px;
			gap: 2px;
		}

		.romaji {
			font-size: 0.6rem;
		}
	}

	.romaji {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.quiz {
		max-width: 520px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	.quiz-diagram {
		width: 100%;
	}

	.prompt {
		font-size: 1.25rem;
		min-height: 1.5em;
		text-align: center;
	}

	.correct {
		color: var(--correct);
	}

	.wrong {
		color: var(--wrong);
	}

	.choices {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		width: 100%;
		gap: 12px;
	}

	.choices button {
		padding: 16px;
		font-size: 1.05rem;
		color: var(--text-primary);
		text-transform: lowercase;
	}

	.choices button:not(:disabled):hover {
		background: var(--bg-tertiary);
	}

	.choice.right {
		border-color: var(--correct);
		color: var(--correct);
		background: color-mix(in srgb, var(--correct) 10%, transparent);
	}

	.choice.wrong {
		border-color: var(--wrong);
		color: var(--wrong);
		background: color-mix(in srgb, var(--wrong) 10%, transparent);
	}

	.next {
		padding: 8px 24px;
		background: var(--accent-dim);
		border: 1px solid var(--accent);
		border-radius: 8px;
		color: var(--accent);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
	}

	.score {
		display: flex;
		gap: 16px;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.attribution {
		margin-top: auto;
		padding-top: 24px;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.attribution a {
		color: var(--text-secondary);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.attribution a:hover {
		color: var(--accent);
	}
</style>
