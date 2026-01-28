<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<title>0xfinder</title>
	<meta name="description" content="Personal website of 0xfinder" />
</svelte:head>

<Nav />

<main>
	{@render children()}
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 100px 24px 80px;
		min-height: 100vh;
	}
</style>
