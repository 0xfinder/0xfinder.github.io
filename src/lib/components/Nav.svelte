<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	
	const links = [
		{ href: '/', label: 'About' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' }
	];
</script>

<nav>
	<div class="nav-inner">
		<a href="/" class="logo">
			<span class="logo-text">0xfinder</span>
		</a>
		<div class="nav-right">
			<div class="nav-links">
				{#each links as link}
					<a 
						href={link.href} 
						class="nav-link"
						class:active={page.url.pathname === link.href}
					>
						{link.label}
					</a>
				{/each}
			</div>
			<ThemeToggle />
		</div>
	</div>
</nav>

<style>
	nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		padding: 0 24px;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		background: color-mix(in srgb, var(--bg-primary) 80%, transparent);
		border-bottom: 1px solid var(--border);
	}
	
	.nav-inner {
		max-width: 800px;
		margin: 0 auto;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	
	
	.logo {
		display: flex;
		align-items: center;
		gap: 2px;
		font-weight: 600;
		font-size: 1.1rem;
		color: var(--text-primary);
	}
	
	.logo:hover {
		color: var(--text-secondary);
	}
	
	.nav-links {
		display: flex;
		gap: 8px;
	}
	
	.nav-link {
		padding: 6px 14px;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-secondary);
		transition: all 0.2s ease;
	}
	
	.nav-link:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}
	
	.nav-link.active {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}
	
	.nav-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	
	
	@media (max-width: 600px) {
		.logo-text {
			display: none;
		}
		
		.nav-link {
			padding: 6px 10px;
			font-size: 0.85rem;
		}
	}
</style>
