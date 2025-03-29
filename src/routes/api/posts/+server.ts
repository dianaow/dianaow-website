import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getAllPosts } from '$lib/posts'

export const GET: RequestHandler = async () => {
	try {
		const posts = await getAllPosts()
		return json(posts)
	} catch (error) {
		return json({ error: 'Failed to load posts' }, { status: 500 })
	}
}
