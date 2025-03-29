import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/posts');
		if (!response.ok) {
			throw error(500, 'Failed to load posts');
		}
		const posts = await response.json();
		return {
			posts
		};
	} catch (e) {
		throw error(500, 'Failed to load posts');
	}
};
