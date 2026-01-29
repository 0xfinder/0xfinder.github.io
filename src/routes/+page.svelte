<script lang="ts">
import { onMount } from "svelte";

let visible = $state(false);

onMount(() => {
	visible = true;
});
</script>

<svelte:head>
	<title>0xfinder</title>
</svelte:head>

<div class="about" class:visible>
	<div class="intro">
		<p class="greeting">Hey, I'm</p>
		<h1 class="name">
			finder<span class="cursor"></span>
		</h1>
	</div>
	
	<div class="bio">
		<p>
			i like writing code and working with AI
		</p>
		
		<p>
			i'm currently interested in <span class="tag">web development</span>, 
			<span class="tag">systems programming</span>, and 
			<span class="tag">blockchains</span>.
		</p>
	</div>
	
	<div class="links-section">
		<h2>Find me</h2>
		<div class="social-links">
			<a href="https://github.com/0xfinder" target="_blank" rel="noopener" class="link-card">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
				</svg>
				<span>GitHub</span>
			</a>
			<a href="https://x.com/0xfinder" target="_blank" rel="noopener" class="link-card">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
				</svg>
				<span>Twitter</span>
			</a>
		</div>
	</div>

	
</div>

<style>
	.about {
		position: relative;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}
	
	.about.visible {
		opacity: 1;
		transform: translateY(0);
	}
	
	.intro {
		margin-bottom: 48px;
	}
	
	.greeting {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 8px;
		font-weight: 500;
	}
	
	.name {
		font-size: clamp(2.5rem, 8vw, 4rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		display: flex;
		align-items: center;
	}
	
	.accent {
		color: var(--accent);
	}
	
	.cursor {
		width: 4px;
		height: 0.9em;
		background: var(--accent);
		margin-left: 4px;
		animation: blink 1s step-end infinite;
		box-shadow: 0 0 20px var(--accent-glow);
	}
	
	@keyframes blink {
		50% { opacity: 0; }
	}
	
	.bio {
		margin-bottom: 48px;
	}
	
	.bio p {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 16px;
		max-width: 600px;
	}
	
	.tag {
		display: inline-block;
		padding: 2px 10px;
		background: var(--accent-dim);
		color: var(--accent);
		border-radius: 4px;
		font-size: 0.95rem;
		font-weight: 500;
	}
	
	.links-section h2 {
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-secondary);
		margin-bottom: 16px;
		font-weight: 500;
	}
	
	.social-links {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	
	.link-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 20px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 10px;
		color: var(--text-primary);
		font-weight: 500;
		transition: all 0.2s ease;
	}
	
	.link-card:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	
	.link-card svg {
		color: var(--text-secondary);
		transition: color 0.2s ease;
	}
	
	.link-card:hover svg {
		color: var(--text-primary);
	}
</style>
