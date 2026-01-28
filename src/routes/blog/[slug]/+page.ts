import type { PageLoad } from './$types';

function calculateReadTime(content: string): number {
	const wordsPerMinute = 200;
	const text = content.replace(/<[^>]*>/g, '').replace(/[#*`\-_]/g, '');
	const words = text.split(/\s+/).filter((word) => word.length > 0).length;
	return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export const load: PageLoad = async ({ params }) => {
	const post = await import(`../../../content/blog/${params.slug}.md`);

	// Get raw content for read time calculation
	const rawContent = await import(`../../../content/blog/${params.slug}.md?raw`);
	const readTime = calculateReadTime(rawContent.default);

	return {
		content: post.default,
		meta: post.metadata as { title: string; description: string; date: string },
		readTime
	};
};
