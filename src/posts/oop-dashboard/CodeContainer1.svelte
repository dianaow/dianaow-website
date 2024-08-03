<script>
  import CodeBlock from './CodeBlock.svelte';
  import Steps from './Steps.svelte';

  let code = `
export default class AppStore extends EventDispatcher {
	#value;

	constructor(value) {
		super();
		this.#value = null;
		this.value = value;
	}

	/**
	 * Subscribe to changes with callback function.
	 * @param {function} callback - Call this function on every change.
	 * @returns {function} - Function whose call will unsubscribe registered callback.
	 */
	subscribe(callback) {
		callback?.(this.#value, this.#value);
		return this.addEventListener(AppStoreEventType.CHANGE, ({ data, oldData, target }) => callback(data, oldData, target));
	}

	/**
	 * Alias for value setter.
	 * @param {*} value - Value to set.
	 */
	set(value) {
		this.#setValue(value);
	}
	
	/**
	 * Set current value.
	 * @param {*} value - Value to set.
	 */
	set value(value) {
		this.#setValue(value);
	}

	#setValue(value) {
		if (Object.is(value, this.#value)) {
			return;
		}

		this.#value = value;
		this.dispatchEvent(new AppEvent(AppStoreEventType.CHANGE, value));
	}

	/**
	 * @returns {*} - Current value.
	 */
	get value() {
		return this.#value;
	}

	/**
	 * Set value taking return from given function.
	 * @param {*} fn - Function that returns value to set.
	 */
	update(fn) {
		this.value = fn(this.#value);
		return this;
	}
}
  `;

  let highlightedLines = [];

  const steps = [
    { text: "The subscribe method of the AppStore class is called with handler as the argument. This method registers the handler to be called whenever the store's value changes (ie. when the private setValue method gets triggered).", lines: [15, 16, 17, 18], color: '#FFD700' },
    { text: "When you assign a new value to the store's value property, it triggers the #setValue function, which then triggers the event listener in the subscribe method. The value setter provides a more intuitive way to update the store's value.", lines: [32, 33, 34], color: '#00FFFF' },
    { text: "The set method is an alias for the value setter", lines: [24, 25, 26], color: '#FF00FF'}
  ];

  function handleHighlight(event) {
    highlightedLines = event.detail;
  }
</script>

<div class="container-code">
  <CodeBlock {code} {highlightedLines} {steps}/>
  <Steps {steps} on:highlight={handleHighlight} />
</div>

<style>
  .container-code {
    display: flex;
    width: 100%;
		margin: 0rem 0rem 3.5rem 0rem;
  }
</style>