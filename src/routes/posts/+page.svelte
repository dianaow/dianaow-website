<script lang="ts">
	import { formatDate } from '$lib/utils'
	import * as config from '$lib/config'

	export let data
</script>

<svelte:head>
	<title>{config.title}</title>
</svelte:head>

<section class='p-10 lg:p-20'>
	<h1>Blog</h1>
	{#each data.posts as post}
		<div class="pb-4">
			<a href={post.slug} class="title"><h2>{post.title}</h2></a>
			<p class="date">{formatDate(post.date)}</p>
			<h4>{post.description}</h4>
			<div class="tags">
				{#each post.categories as category}
					<button>{category}</button>
				{/each}
			</div>			
		</div>
	{/each}
</section>
