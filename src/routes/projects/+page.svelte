<script lang="ts">
	import { onMount } from 'svelte';
	
	let visible = $state(false);
	
	onMount(() => {
		visible = true;
	});
	
	const projects = [
		{
			name: 'Albedo',
			description: 'Personal Telegram bot for tracking wallets and Polymarket activity — because the Polymarket UI sucks.',
			tags: ['Rust', 'Telegram Bot', 'Polymarket', 'SQLite'],
			url: 'https://github.com/0xfinder/albedo'
		}
	];
</script>

<svelte:head>
	<title>Projects | 0xfinder</title>
</svelte:head>

<div class="projects" class:visible>
	<h1>Projects</h1>
	<p class="subtitle">Things I've built and contributed to.</p>
	
	<div class="grid">
		{#each projects as project, i}
			<a href={project.url} target="_blank" rel="noopener" class="project-card" style="animation-delay: {i * 0.1}s">
				<div class="card-header">
					<h3>{project.name}</h3>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M7 17L17 7M7 7h10v10"/>
					</svg>
				</div>
				<p>{project.description}</p>
				<div class="tags">
					{#each project.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.projects {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}
	
	.projects.visible {
		opacity: 1;
		transform: translateY(0);
	}
	
	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 8px;
	}
	
	.subtitle {
		color: var(--text-secondary);
		margin-bottom: 48px;
	}
	
	.grid {
		display: grid;
		gap: 16px;
	}
	
	.project-card {
		display: block;
		padding: 24px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 12px;
		color: inherit;
		text-decoration: none;
		transition: all 0.2s ease;
		animation: fadeUp 0.5s ease forwards;
		opacity: 0;
	}
	
	@keyframes fadeUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}
	
	.project-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}
	
	.project-card h3 {
		font-size: 1.2rem;
		margin-bottom: 8px;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.card-header svg {
		color: var(--text-secondary);
		transition: color 0.2s ease, transform 0.2s ease;
	}

	.project-card:hover .card-header svg {
		color: var(--accent);
		transform: translate(2px, -2px);
	}
	
	.project-card p {
		color: var(--text-secondary);
		font-size: 0.95rem;
		margin-bottom: 16px;
	}
	
	.tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	
	.tag {
		font-size: 0.8rem;
		padding: 4px 10px;
		background: var(--accent-dim);
		color: var(--accent);
		border-radius: 4px;
		font-weight: 500;
	}
</style>
