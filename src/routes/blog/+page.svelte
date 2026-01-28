<script lang="ts">
	import { onMount } from 'svelte';
	import type { Post } from '$lib/posts';

	let { data } = $props();
	let visible = $state(false);

	onMount(() => {
		visible = true;
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog | 0xfinder</title>
</svelte:head>

<div class="blog" class:visible>
	<h1>Blog</h1>
	<p class="subtitle">Thoughts, learnings, and things I find interesting.</p>

	{#if data.posts.length === 0}
		<div class="empty">
			<p>No posts yet. Stay tuned!</p>
		</div>
	{:else}
		<div class="posts">
			{#each data.posts as post, i}
				<a href="/blog/{post.slug}" class="post-card" style="animation-delay: {i * 0.1}s">
					<span class="date">{formatDate(post.date)}</span>
					<h3>{post.title}</h3>
					<p>{post.description}</p>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.blog {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.blog.visible {
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

	.empty {
		padding: 48px;
		text-align: center;
		color: var(--text-muted);
		background: var(--bg-secondary);
		border: 1px dashed var(--border);
		border-radius: 12px;
	}

	.posts {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.post-card {
		display: block;
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

	.post-card:hover {
		border-color: var(--text-secondary);
		transform: translateX(4px);
	}

	.date {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-family: 'Geist Mono', monospace;
	}

	.post-card h3 {
		font-size: 1.2rem;
		margin: 8px 0;
		color: var(--text-primary);
	}

	.post-card p {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}
</style>
