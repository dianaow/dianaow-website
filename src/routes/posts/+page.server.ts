import type { PageServerLoad } from './$types'
import type { Post } from '$lib/types'

export const load: PageServerLoad = async function({ fetch }) {
	const response = await fetch('api/posts')
	const posts: Post[] = await response.json()
	return { posts }
}
