<script lang="ts">
	import { onMount } from 'svelte';
	
	let visible = $state(false);
	
	onMount(() => {
		visible = true;
	});
	
	const projects = [
		{
			name: 'Coming Soon',
			description: 'Projects will be listed here.',
			tags: ['WIP']
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
			<div class="project-card" style="animation-delay: {i * 0.1}s">
				<h3>{project.name}</h3>
				<p>{project.description}</p>
				<div class="tags">
					{#each project.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</div>
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
		padding: 24px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 12px;
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
