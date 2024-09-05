<script lang="ts">
	import Footer from './footer.svelte'
	import Header from './header.svelte'

	import '../app.css'
</script>

<div class='max-w-7xl mx-auto min-h-screen'>
	<Header />

	<main>
		<slot />
	</main>

	<Footer />
</div>

<style>
	.layout {
		height: 100%;
		max-inline-size: 1440px;
		display: grid;
		grid-template-rows: auto 1fr auto;
		margin-inline: auto;
	}

	@media (min-width: 1440px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>
