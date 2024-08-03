<script>
  import CodeBlock from './CodeBlock.svelte';
  import Steps from './Steps.svelte';
	import image from './images/svg_singleview.png';

  let code = `
export default class SingleViewChart extends ChartDataLoader {
	#viewName;
	#viewInstance;

	constructor() {
		super();
		this.mergeConfig(defaultConfig);

		// Instance of the main view
		this.#viewInstance = null;

		this.#enableEventListeners();

		this.addEventListener(AppEventType.CHANGE_CONFIG, () => {
			this.updateView();
		});
	}

	updateView() {
		if (this.#viewInstance) {
			this.#viewInstance.width = this.width - (this.config?.padding?.left || 0) - (this.config?.padding?.right || 0);
			this.#viewInstance.height = this.height - (this.config?.padding?.top || 0) - (this.config?.padding?.bottom || 0);
			this.#viewInstance.x = this.config?.padding?.left || 0;
			this.#viewInstance.y = this.config?.padding?.top || 0;
		}
	}

	/**
	 * @param {string} value - Name of the view to display data. @see ChartViewType
	 */
	set #view(value) {
		if (this.#viewName === value) {
			return;
		}

		this.removeChild(this.#viewInstance);
		this.#viewInstance?.destroy();
		this.#viewInstance = null;

		if (chartViews[value]) {
			// Create view instance.
			this.#viewInstance = this.addChild(new chartViews[value]());

			// Set context.
			this.#viewInstance.context.parent = this.context;

			// Set data if already available.
			this.#viewInstance.data = this.data;

		} 

		this.#viewName = value;

		this.updateView();
	}

	/**
	 * @return {string} - Name of the currently used view to display data. @see ChartViewType.js
	 */
	get #view() {
		return this.#viewName;
	}


	get viewInstance() {
		return this.#viewInstance;
	}

	/**
	 * Enable event listeners to update existing view instance.
	 */
	#enableEventListeners() {
		this.context.subscribe(ChartOption.CHART_VIEW, value => {
			this.#view = value;
		});

		this.addEventListener(AppEventType.CHANGE_WIDTH, () => {
			if (this.#viewInstance) this.#viewInstance.width = this.width;
		});

		this.addEventListener(AppEventType.CHANGE_HEIGHT, () => {
			if (this.#viewInstance) this.#viewInstance.height = this.height;
		});

		this.addEventListener(AppEventType.DATA_UPDATED, () => {
			if (this.#viewInstance) this.#viewInstance.data = this.data;
		});
	}
}
  `;

  let highlightedLines = [];

  const steps = [
    { text: "When there is a new CHART_VIEW value, such as either Line or Graph, #view is set, removing the existing view and adding a new one.", lines: [72,73,74,75], color: '#FFD700' },
		{ text: "A new specified view is initialized with `new chartViews[value]`. For example a Line or Graph view is initialized. #viewInstance represents the newly created svg element, which it is added to the DOM as a child of the svg element representing the chart body", lines: [42], color: '#00FFFF'},
    { text: "When any of the chart's configuration parameter such as data, width or height changes individually, the view is updated", lines: [77,78,79,80,81,82,83,84,85,86,87], color: '#FF00FF'},
  ];

  function handleHighlight(event) {
    highlightedLines = event.detail;
  }
</script>

<div class="container-code">
	<CodeBlock {code} {highlightedLines} {steps} blockName='/src/packages/charts/modular/general/SingleViewChart.js' />
	<Steps {steps} on:highlight={handleHighlight} {image} />
</div>

<style>
  .container-code {
		display: flex;
    width: 100%;
  }
</style>