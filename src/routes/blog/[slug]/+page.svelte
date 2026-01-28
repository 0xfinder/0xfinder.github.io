<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();
	let visible = $state(false);
	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let activeId = $state('');

	onMount(() => {
		visible = true;

		// Extract headings from the rendered content
		const article = document.querySelector('.content');
		if (article) {
			const h2s = article.querySelectorAll('h2');
			headings = Array.from(h2s).map((h, i) => {
				const id = h.id || `heading-${i}`;
				h.id = id;
				return { id, text: h.textContent || '', level: 2 };
			});

			// Set up intersection observer for scroll spy
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							activeId = entry.target.id;
						}
					});
				},
				{ rootMargin: '-80px 0px -80% 0px' }
			);

			h2s.forEach((h) => observer.observe(h));

			return () => observer.disconnect();
		}
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function scrollToHeading(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<svelte:head>
	<title>{data.meta.title} | 0xfinder</title>
	<meta name="description" content={data.meta.description} />
</svelte:head>

{#if headings.length > 0}
	<aside class="toc">
		<nav>
			{#each headings as heading}
				<button
					class="toc-link"
					class:active={activeId === heading.id}
					onclick={() => scrollToHeading(heading.id)}
				>
					{heading.text}
				</button>
			{/each}
		</nav>
	</aside>
{/if}

<div class="post-layout" class:visible>
	<article class="post">
		<header>
			<a href="/blog" class="back">← Back to blog</a>
			<h1>{data.meta.title}</h1>
			<div class="meta">
				<span class="date">{formatDate(data.meta.date)}</span>
				<span class="separator">·</span>
				<span class="read-time">{data.readTime} min read</span>
			</div>
			<div class="author">
				<img src="/avatar.png" alt="0xfinder" class="avatar" />
				<div class="author-info">
					<span class="author-name">0xfinder</span>
					<span class="author-title">Developer</span>
				</div>
			</div>
		</header>

		<div class="content">
			<data.content />
		</div>
	</article>
</div>

<style>
	.post-layout {
		position: relative;
		max-width: 700px;
		margin: 0 auto;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.post-layout.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.post {
		width: 100%;
	}

	header {
		margin-bottom: 48px;
	}

	.back {
		display: inline-block;
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin-bottom: 24px;
		text-decoration: none;
	}

	.back:hover {
		color: var(--text-primary);
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 12px;
		line-height: 1.2;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-muted);
		font-size: 0.9rem;
		margin-bottom: 24px;
	}

	.separator {
		color: var(--text-muted);
	}

	.author {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.author-info {
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-weight: 600;
		color: var(--text-primary);
	}

	.author-title {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	/* TOC styles */
	.toc {
		position: fixed;
		top: 120px;
		left: calc(50% + 380px);
		width: 200px;
		padding-left: 16px;
		border-left: 1px solid var(--border);
	}

	@media (max-width: 1100px) {
		.toc {
			display: none;
		}
	}

	.toc nav {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.toc-link {
		background: none;
		border: none;
		padding: 4px 0;
		text-align: left;
		font-size: 0.85rem;
		color: var(--text-muted);
		cursor: pointer;
		transition: color 0.2s ease;
		font-family: inherit;
	}

	.toc-link:hover {
		color: var(--text-secondary);
	}

	.toc-link.active {
		color: var(--text-primary);
	}

	/* Content styles */
	.content {
		line-height: 1.8;
	}

	.content :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 48px;
		margin-bottom: 16px;
		scroll-margin-top: 100px;
	}

	.content :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 32px;
		margin-bottom: 12px;
	}

	.content :global(p) {
		margin-bottom: 24px;
		color: var(--text-secondary);
	}

	.content :global(ul),
	.content :global(ol) {
		margin-bottom: 24px;
		padding-left: 24px;
		color: var(--text-secondary);
	}

	.content :global(li) {
		margin-bottom: 8px;
	}

	.content :global(pre) {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		margin-bottom: 24px;
		font-family: 'Geist Mono', monospace;
		font-size: 0.9rem;
	}

	.content :global(code) {
		font-family: 'Geist Mono', monospace;
	}

	.content :global(a) {
		color: var(--text-primary);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.content :global(a:hover) {
		color: var(--text-secondary);
	}

	.content :global(blockquote) {
		border-left: 3px solid var(--border);
		padding-left: 16px;
		margin: 24px 0;
		color: var(--text-muted);
		font-style: italic;
	}
</style>
