<script lang="ts">
	import { formatDate } from '$lib/utils'
	import * as config from '$lib/config'

	export let data

	$: roundups = data.posts.filter(d => d.type === 'roundup')
	$: posts = data.posts.filter(d => d.type !== 'roundup')
</script>

<svelte:head>
	<title>{config.title}</title>
</svelte:head>

<section class='p-10 lg:p-20'>
	<h1 style='color: white'>Monthly Roundup</h1>
	{#each roundups as post}
		<div class="pb-4">
			<a href={'/posts/' + post.slug} class="title"><h2 >{post.title}</h2></a>
			<h4 style='margin: 0px'>{post.description}</h4>			
		</div>
	{/each}
	<br><br>
	<h1 style='color: white'>Blog</h1>
	{#each posts as post}
		<div class="pb-4">
			<a href={'/posts/' + post.slug} class="title"><h2>{post.title}</h2></a>
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
