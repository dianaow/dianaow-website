<script lang="ts">
	import { formatDate } from '$lib/utils'

	export let data
</script>

<!-- SEO -->
<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title}/>
	<meta property="og:image" content={data.meta.thumbnail}/>
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:site" content="@notforcasual">
	<meta name="twitter:title" content={data.meta.title}>
	<meta name="twitter:description" content={data.meta.description}>
	<meta name="twitter:image" content={data.meta.thumbnail}>
</svelte:head>

{#if data.meta.type !== 'casestudy'}
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
{/if}

{#if data.meta.type === 'casestudy'}
<article class="centered">
  <!-- Title -->
  <hgroup style="text-align: center;">
    <h1>{data.meta.title}</h1>
  </hgroup>

  <!-- Image -->
  {#if data.meta.image}
    <div class="image-container">
      <img src={data.meta.image} alt="Article image" style="border-radius: 8px;"/>
    </div>
  {/if}

  <!-- Tags -->
  <div class="tags" style="text-align: center;">
		<p style="font-size: 0.75em;">{formatDate(data.meta.date)}</p>
    {#each data.meta.categories as category}
      <button>{category}</button>
    {/each}
  </div>

  <!-- Links -->
  <div class="links" style="text-align: center;">
    {#if data.meta.website}
      <a href={data.meta.website} target="_blank" style="margin-right: 10px;">Website</a>
    {/if}
    {#if data.meta.github}
      <a href={data.meta.github} target="_blank" style="margin-right: 10px;">GitHub</a>
    {/if}
  </div>

  <!-- Post Content -->
  <div>
    <svelte:component this={data.content} />
  </div>
</article>
{/if}

<style>
  .centered {
    max-width: 1000px;
    margin: 0 auto;
  }
</style>

