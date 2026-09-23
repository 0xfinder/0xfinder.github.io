<script lang="ts">
	import { ITEMS_URL } from '../api';
	import type { DetailsFrame, Item } from '../types';

	type Props = {
		participantId: number;
		lastFrame: DetailsFrame;
		items: Record<string, Item>;
		patchVersion: string;
	};

	let { participantId, lastFrame, items, patchVersion }: Props = $props();

	// (3364, 3363, 3340) are ward trinkets, 3513 is the Rift Herald buff.
	const sortItems = (a: number, b: number) => {
		if (a === 3364 || a === 3363 || a === 3340 || a === 3513) return -1;
		if (b === 3364 || b === 3363 || b === 3340 || a === 3513) return 1;
		return b - a;
	};

	// Ward trinkets sort to the front and get their own slot, so the six item
	// slots hold real purchases only.
	const sorted = $derived.by(() => {
		const ids = Array.from(new Set(lastFrame.participants[participantId].items)).sort(sortItems);
		let trinket = -1;
		if (ids[0] !== undefined && (ids[0] === 3340 || ids[0] === 3363 || ids[0] === 3364)) {
			trinket = ids.shift() as number;
		}
		return { ids, trinket };
	});

	const itemsUrl = $derived(ITEMS_URL.replace('PATCH_VERSION', patchVersion));

	function descriptionLines(item: Item | undefined): string[] {
		if (!item) return [];
		return item.description
			.split('<li>')
			.join('<br>')
			.split('<br>')
			.map((line) => line.replaceAll(/<\/\w+>/gi, '').replaceAll(/<\w+>/gi, ''));
	}

	let shown = $state<number | null>(null);
</script>

<div class="player-stats-items">
	{#each Array.from({ length: 6 }) as _, i (i)}
		{#if sorted.ids[i] !== undefined}
			{@const itemId = sorted.ids[i]}
			<div
				class="player-stats-item"
				role="presentation"
				onmouseenter={() => (shown = i)}
				onmouseleave={() => (shown = null)}
				ontouchstart={() => (shown = i)}
				ontouchend={() => (shown = null)}
			>
				<div class="itemDescription" class:shown={shown === i}>
					<div class="itemName">{items[itemId]?.name}</div>
					{#each descriptionLines(items[itemId]) as line}
						<div>{line}</div>
					{/each}
				</div>
				<img alt="" src="{itemsUrl}{itemId}.png" />
			</div>
		{:else}
			<div class="player-stats-item empty"></div>
		{/if}
	{/each}

	{#if sorted.trinket !== -1}
		<div class="player-stats-item">
			<img alt="" src="{itemsUrl}{sorted.trinket}.png" />
		</div>
	{:else}
		<div class="player-stats-item empty"></div>
	{/if}
</div>
