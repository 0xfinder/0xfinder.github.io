export interface Post {
	slug: string;
	title: string;
	description: string;
	date: string;
}

export async function getPosts(): Promise<Post[]> {
	const modules = import.meta.glob('/src/content/blog/*.md', { eager: true });

	const posts: Post[] = [];

	for (const path in modules) {
		const mod = modules[path] as { metadata: { title: string; description: string; date: string } };
		const slug = path.split('/').pop()?.replace('.md', '') ?? '';

		posts.push({
			slug,
			title: mod.metadata.title,
			description: mod.metadata.description,
			date: mod.metadata.date
		});
	}

	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
