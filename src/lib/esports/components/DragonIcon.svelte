<script lang="ts">
	import Chemtech from '../icons/dragon-chemtech.svelte';
	import Cloud from '../icons/dragon-cloud.svelte';
	import Elder from '../icons/dragon-elder.svelte';
	import Hextech from '../icons/dragon-hextech.svelte';
	import Infernal from '../icons/dragon-infernal.svelte';
	import Mountain from '../icons/dragon-mountain.svelte';
	import Ocean from '../icons/dragon-ocean.svelte';

	type Props = {
		dragonName: string;
	};

	let { dragonName }: Props = $props();
</script>

{#if dragonName === 'ocean'}
	<Ocean class="dragon" />
{:else if dragonName === 'hextech'}
	<Hextech class="dragon" />
{:else if dragonName === 'chemtech'}
	<Chemtech class="dragon" />
{:else if dragonName === 'infernal'}
	<Infernal class="dragon" />
{:else if dragonName === 'cloud'}
	<Cloud class="dragon" />
{:else if dragonName === 'mountain'}
	<Mountain class="dragon" />
{:else if dragonName === 'elder'}
	<Elder class="dragon" />
{/if}
