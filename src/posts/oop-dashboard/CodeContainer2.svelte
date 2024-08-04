<script>
  import CodeBlock from './CodeBlock.svelte';
  import Steps from './Steps.svelte';

  let code = `
	import { onMount, onDestroy } from 'svelte';
	import ChartContext from '@/packages/data/ChartContext';
	import ChartModule from '@/packages/charts/modular/general/chart-module/ChartModule';

	export let context;

	let targetEl;

	let plotInstance = null;

	const localContext = new ChartContext(context);

	onMount(() => {
		plotInstance = new ChartModule();
		targetEl.appendChild(plotInstance.root.node());
		plotInstance.width = targetEl.clientWidth;
		plotInstance.height = targetEl.clientHeight;
		plotInstance.context.parent = localContext;
	});

	onDestroy(() => {
		plotInstance?.destroy();
		localContext?.destroy();
	});

  <div class="chart">
    <div class="plot-container" bind:this={targetEl} />
  </div>
  `;

  let highlightedLines = [];

  const steps = [
    { text: "A new chart context is initialized with the parent context. This is meant to localize the context to the component.", lines: [11], color: '#FFD700' },
    { text: "A new ChartModule instance is initialized, which displays a chart based on the chart context.", lines: [14], color: '#00FFFF'},
    { text: "The chart's root element is added to the targetEl in the DOM.", lines: [15], color: '#FF00FF'},
    { text: "The div with the class plot-container is bound to the targetEl variable using Svelte's bind:this directive. It is the spot on the UI where the chart will appear, and `bind:this={targetEl}` is a way to remember this spot so we can use it in our code.", lines: [27], color: '#00FF00'},
    { text: "The purpose of linking the chart instance's context to the local context, is to ensure that the chart instance has access to all necessary data and configuration settings contained within localContext.", lines: [18], color: '#FFA500'},
    { text: "The local context and plot instance is destroyed when the component is destroyed and thus break all connections with the component that we no longer need.", lines: [22,23], color: '#FF69B4' },
  ];

  function handleHighlight(event) {
    highlightedLines = event.detail;
  }
</script>

<div class="container-code">
  <CodeBlock {code} {highlightedLines} {steps} lang="svelte" blockName='/src/svelte-components/dashboard/DashboardCharts.svelte'/>
  <Steps {steps} on:highlight={handleHighlight} />
</div>

<style>
	.container-code {
		display: flex;
		width: 100%;
		margin: 0rem 0rem 3.5rem 0rem;
	}
</style>