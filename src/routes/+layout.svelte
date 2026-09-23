<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Nav from '$lib/components/Nav.svelte';
	
	let { children } = $props();

	// The esports scoreboard needs more room than the reading-width default.
	const wide = $derived(page.url.pathname.startsWith('/esports'));
</script>

<svelte:head>
	<meta name="description" content="Personal website of 0xfinder" />
</svelte:head>

<Nav />

<main class:wide>
	{@render children()}
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 100px 24px 80px;
		min-height: 100vh;
	}

	main.wide {
		max-width: 1180px;
	}
</style>
