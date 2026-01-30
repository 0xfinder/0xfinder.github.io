import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			highlight: {
				highlighter: async (code, lang) => {
					const { codeToHtml } = await import('shiki');
					try {
						const html = await codeToHtml(code, { 
							lang: lang || 'plaintext', 
							themes: {
								light: 'catppuccin-latte',
								dark: 'catppuccin-mocha'
							}
						});
						return html;
					} catch {
						return `<pre><code>${code}</code></pre>`;
					}
				}
			}
		})
	],
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		})
	}
};

export default config;
