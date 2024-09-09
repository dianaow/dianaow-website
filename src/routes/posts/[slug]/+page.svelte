<script lang="ts">
	import { formatDate } from '$lib/utils'

	export let data
</script>

<!-- SEO -->
<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.thumbnail} />
	<meta property="og:image" content="URL_to_your_image"/>
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:site" content="@notforcasual">
	<meta name="twitter:title" content={data.meta.title} >
	<meta name="twitter:description" content={data.meta.description}>
	<meta name="twitter:image" content={data.meta.thumbnail}>
</svelte:head>

<article>
  <!-- Title -->
	<hgroup>
		<h1>{data.meta.title}</h1>
		<p>Published at {formatDate(data.meta.date)}</p>
	</hgroup>

  <!-- Tags -->
	<div class="tags">
		{#each data.meta.categories as category}
			<button>{category}</button>
		{/each}
	</div>

  <!-- Post -->
	<div>
		<svelte:component this={data.content} />
	</div>
</article>
