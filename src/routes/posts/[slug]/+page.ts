import type { PageServerLoad } from '../$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async function({ params }) {
	try {
		console.log('page', params)
		const post = await import(`../../../posts/${params.slug}/${params.slug}.md`)

		return {
			content: post.default,
			meta: post.metadata
		}
	} catch (e) {
		error(404, `Could not find ${params.slug}`)
	}
}
