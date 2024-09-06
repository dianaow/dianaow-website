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