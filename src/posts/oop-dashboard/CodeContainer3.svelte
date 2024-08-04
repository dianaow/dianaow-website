<script>
  import CodeBlock from './CodeBlock.svelte';
  import Steps from './Steps.svelte';
	import image from './images/svg_chartmodule.png';

  let code = `
export default class ChartModule extends ChartSprite {
	#chartBody = null;

	constructor() {
		super();

		this.context.subscribe(ChartOption.CHART_VIEW, () => {
			this.#createChartBody();
		})

	#createChartBody() {
		// Proceed if the context is a data context.
		if (this.context instanceof ChartContext) {
			// Remove the chart body if it is not a single view chart.
			if (!(this.#chartBody instanceof SingleViewChart)) {
				this.#removeChartBody();
				this.#chartBody = new SingleViewChart();
				this.addChild(this.#chartBody);
			}

			this.#chartBody.context.parent = this.context;
		}

		// Otherwise, remove the chart body.
		else {
			this.#removeChartBody();
		}

		this.#updateChartBody();
	}

	#removeChartBody() {
		if (this.#chartBody instanceof Sprite) {
			this.removeChild(this.#chartBody);
			this.#chartBody.destroy();
			this.#chartBody = null;
		}
	}

	#updateChartBody() {
		if (this.#chartBody) {
			this.#chartBody.x = this.config.padding.left ?? 0;
			this.#chartBody.y = this.config.padding.top ?? 0;
			this.#chartBody.width = this.width - (this.config.padding.left ?? 0) - (this.config.padding.right ?? 0);
			this.#chartBody.height = this.height - (this.config.padding.top ?? 0) - (this.config.padding.bottom ?? 0);
		}
  }

	destroy() {
		super.destroy();
		this.#removeChartBody();
	}
}
  `;

  let highlightedLines = [];

  const steps = [
    { text: "When CHART_VIEW is assigned an initial value, a function to create a chart body is called", lines: [7,8,9], color: '#FFD700' },
    { text: "Another class called SingleViewChart is initialized, and returns an svg element representing the created chart body.`", lines: [17], color: '#00FFFF'},
    { text: "Adds the newly created SingleViewChart instance as a child to the current object. addChild is a function in the parent Sprite class that will add the chart body to the DOM, nested within the div called 'plot-container'.", lines: [20], color: '#FF00FF'},
  ];

  function handleHighlight(event) {
    highlightedLines = event.detail;
  }
</script>

<div class="container-code">
	<CodeBlock {code} {highlightedLines} {steps} blockName='/src/packages/charts/modular/general/ChartModule.js' />
	<Steps {steps} on:highlight={handleHighlight} {image} />
</div>

<style>
	.container-code {
		display: flex;
		width: 100%;
		margin: 0rem 0rem 3.5rem 0rem;
	}
</style>