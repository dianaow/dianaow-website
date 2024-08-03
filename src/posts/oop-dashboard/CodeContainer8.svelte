<script>
  import CodeBlock from './CodeBlock.svelte';

  let code = `
export default class ChartView extends ChartSprite {
	#data;
  #xDomain;
	#xRange;
	#yDomain;
	#options;
	#throttleChanges;
	#throttleRedraw;
	#colorScale;
	#colorScaleType;
	#colorScaleName;

	constructor() {
		super();

		// Data to use in redraw method.
		// Typically latest called data.
		this.#data = [];

		// Init color scale.
		this.#colorScale = colorScales['DEFAULT'];

		this.#throttleRedraw = throttler(this.#callRedraw.bind(this));
		const debounceRedraw = debouncer(this.#callRedraw.bind(this), 100, 1000);

    // Init x-domain.
		this.#xDomain = null;

		// Init y-domain.
		this.#yDomain = null;

		// Init color scale type.
		this.#colorScaleType = 'RELATIVE';

		// Init color scale name.
		this.#colorScaleName = 'DEFAULT';

		this.addEventListener(AppEventType.RESIZE, () => {
			debounceRedraw();
		});

		this.addEventListener(AppEventType.CHANGE_DATA_TERMS, () => {
			this.#throttleRedraw();
		});

		this.addEventListener(AppEventType.DATA_UPDATED, () => {
			this.#throttleRedraw();
		});

		this.addEventListener(AppEventType.CHANGE_Y_DOMAIN, () => {
			this.#throttleRedraw();
		});

		this.addEventListener(AppEventType.CHANGE_X_DOMAIN, () => {
			this.#throttleRedraw();
		});

		this.addEventListener(AppEventType.CHANGE_COLOR_SCALE, () => {
			this.#throttleRedraw();
		});
	}

	// Dispatch request to redraw chart.
	#callRedraw() {
		this.#data && this.dispatchEvent(new AppEvent(AppEventType.REDRAW_CHART));
	}

	/**
	 * Destroy component.
	 * Call it if you don't need this anymore.
	 */
	destroy() {
		super.destroy();
		stopThrottler(this.#throttleRedraw);
	}

	/**
	 * @param {string} value - Color scale from ColorScaleType class.
	 */
	set colorScaleType(value) {
		if (value === this.#colorScaleType) {
			return;
		}

		this.#colorScaleType = value;
		this.#throttleChanges();
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COLOR_SCALE_TYPE, value));
	}

	/**
	 * @return {string} - Color scale from ColorScaleType class.
	 */
	get colorScaleType() {
		return this.#colorScaleType;
	}

	/**
	 * @param {string} value - Color scale name from ColorScaleReference class.
	 */
	set colorScaleName(value) {
		if (value === this.#colorScaleName) {
			return;
		}

		this.#colorScaleName = value;
		this.#throttleChanges();
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COLOR_SCALE_NAME, value));
	}

	/**
	 * @return {string} - Color scale from ColorScaleType class.
	 */
	get colorScaleName() {
		return this.#colorScaleName;
	}

  /**
	 * Domain to use as d3.scale domain.
	 * @param {Array.<*>} value - Array of values.
	 */
	set yDomain(value) {
		if (this.#yDomain === value) {
			return;
		}

		this.#yDomain = value;
		this.#throttleChanges();
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_Y_DOMAIN, value));
	}

	/**
	 * Returns current domain.
	 * @returns {Array} - Array of domain values.
	 */
	get yDomain() {
		return this.#yDomain;
	}

	/**
	 * Domain to use as d3.scale domain.
	 * @param {Array.<*>} value - Array of values.
	 */
	set domain(value) {
		if (this.#xDomain === value) {
			return;
		}

		this.#xDomain = value;
		this.#throttleChanges();
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_X_DOMAIN, value));
	}

	/**
	 * Returns current x domain.
	 * @returns {Array} - Array of domain values.
	 */
	get domain() {
		return this.#xDomain;
	}

	/**
	 * Range to use as d3.scale range.
	 * @param {Array.<*>} value - Array of values.
	 */
	set xRange(value) {
		if (this.#xRange === value) {
			return;
		}

		this.#xRange = value;
		this.#throttleChanges();
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_X_RANGE, value));
	}

	get xRange() {
		return this.#xRange;
	}

	/**
	 * X-scale.
	 * @returns {object} - D3-scale function.
	 */
	get xScale() {
		return this.domain && !this.skipGaps
			? d3.scalePoint(this.domain, [this.#xDomainScaleOffset, this.width - this.#xDomainScaleOffset])
			: this.skipGaps
			? d3.scaleTime(this.domain ?? this.timeRange, this.xRange?.map((v, i) => v * this.width + (i % 2 ? -5 : 5)) ?? [0, this.width])
			: d3.scaleTime(this.timeRange || [0, 1], [0, this.width]);
	}

	/**
	 * Y-scale.
	 * @returns {object} - D3-scale function.
	 */
	get yScale() {
		return this.yDomain
			? d3.scaleLinear().domain(this.yDomain).range([this.height, 0])
			: d3
					.scaleLinear()
					.domain([d3.min(this.#data, v => v.value) || 0, d3.max(this.#data, v => v.value) || 1])
					.range([this.height, 0]);
	}

	set options(value) {
		this.#options = value;
		this.#throttleChanges(AppEventType.CHANGE_OPTIONS);
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_OPTIONS));
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_DATA_TERMS, value));
	}

	get options() {
		return this.#options;
	}

	/**
	 * Set color-scale function.
	 * @param {function} type - Funtion that returns color takes index and min-max values as arguments.
	 */
	set colorScale(func) {
		if (this.#colorScale === func) {
			return;
		}

		this.#colorScale = func;
		this.#throttleChanges(AppEventType.CHANGE_OPTIONS);
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_COLOR_SCALE, func));
	}

	/**
	 * Return type of the chart color scale.
	 * @return {function} - Funtion that returns color takes index and max value as arguments.
	 */
	get colorScale() {
		return this.#colorScale;
	}

	/**
	 * @returns {Array} - Promise with requested data
	 */
	get data() {
		return this.#data;
	}

	set data(value) {
		if (value === this.#data) return;
		this.#data = value;
		this.#throttleChanges(AppEventType.DATA_UPDATED);
		this.dispatchEvent(new AppEvent(AppEventType.DATA_UPDATED, value));
	}

}
  `;

</script>

<div class="container-code">
	<span>/src/packages/charts/modular/general/ChartView.js</span>
  <CodeBlock {code} />
</div>

<style>
  .container-code {
    width: 100%;
  }
</style>