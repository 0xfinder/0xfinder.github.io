<script lang="ts">
	import { browser } from '$app/environment';
	
	let theme = $state<'light' | 'dark'>('dark');
	
	$effect(() => {
		if (browser) {
			const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = stored ?? (prefersDark ? 'dark' : 'light');
			document.documentElement.dataset.theme = theme;
		}
	});
	
	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('theme', theme);
	}
</script>

<button onclick={toggle} class="theme-toggle" aria-label="Toggle theme">
	{#if theme === 'dark'}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="5"/>
			<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
		</svg>
	{:else}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 8px;
		border-radius: 8px;
		color: var(--text-secondary);
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.theme-toggle:hover {
		color: var(--accent);
		background: var(--accent-dim);
	}
</style>
