<script>
  import CodeBlock from './CodeBlock.svelte';

  let code = `
export default class ChartDataLoader extends ChartSprite {
	#data;

	constructor() {
		super();

		this.mergeConfig(defaultConfig);

		this.#data = [];

		// Debouncer to accumulate event before start data loading.
		this.#debounceDataLoad = debouncer(this.#loadData.bind(this), 400, 1200);
	}

	async #loadData() {
		this.#data = await dataStore.get(this.context.value(ChartOption.DATA_FIELD), this.context.chartOptions);
	}

	destroy() {
		super.destroy();
		stopDebouncer(this.#debounceDataLoad);
	}

	/**
	 * @returns {Array} - Loaded data.
	 */
	get data() {
		return this.#data;
	}

	set data(value) {
		if (value === this.#data) {
			return;
		}

		this.#data = value;

		this.dispatchEvent(new AppEvent(AppEventType.DATA_UPDATED, value));
	}
}
  `;

</script>

<div class="container-code">
	<span>/src/packages/charts/modular/general/ChartDataLoader.js</span>
  <CodeBlock {code} />
</div>

<style>
  .container-code {
    width: 100%;
  }
</style>