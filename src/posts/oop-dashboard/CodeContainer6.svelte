<script>
  import CodeBlock from './CodeBlock.svelte';

  let code = `
class Sprite extends ConfigurableAppComponent {
	#root;
	#children;
	#childrenContainer;
	#x;
	#y;
	#width;
	#height;

	/**
	 * @constructor
	 */
	constructor() {
		super();

		this.#root = d3.create('svg').classed('sprite-root', true).style('overflow', 'hidden').style('width', '100%').style('display', 'block');

		this.#childrenContainer = this.#root.append('g').attr('class', 'sprite-children');
		this.#children = [];
	}

	/**
	 * Add child sprite.
	 * @param {Sprite} childSprite - Instance of Sprite class.
	 * @returns {Sprite} - Added instance.
	 */
	addChild(childSprite) {
		const index = this.#children.indexOf(childSprite);

		if (index >= 0) {
			this.#children.splice(index, 1);
		}

		this.#children.push(childSprite);
		childSprite.addTo(this);
		this.dispatchEvent(new AppEvent(AppEventType.ADD_CHILD, childSprite));
		return childSprite;
	}

	/**
	 * Remove child of this sprite.
	 * @param {Sprite} childSprite
	 */
	removeChild(childSprite) {
		const index = this.#children.indexOf(childSprite);

		if (index >= 0) {
			const child = this.#children[index];
			child.#parent = null;
			child.#root.node().remove();
			this.#children.splice(index, 1);
		}

		this.dispatchEvent(new AppEvent(AppEventType.REMOVE_CHILD, childSprite));
	}

	/**
	 * Remove this sprite from parent.
	 * @returns {Sprite} - This instance.
	 */
	remove() {
		if (this.parent) {
			this.parent.removeChild(this);
		}

		return this;
	}

	// Append d3 element to the canvas.
	appendElement(element) {
		// this.#childrenContainer.append(() => element.node())
		this.#childrenContainer.node().appendChild(element.node());
	}

	get childrenContainer() {
		return this.#childrenContainer;
	}

	// Add this sprite to another sprite.
	addTo(targetSprite) {
		targetSprite.appendElement(this.#root);
		this.#parent = targetSprite;
	}

	destroy() {
		super.destroy();
	}

	/**
	 * @returns {number}
	 */
	get width() {
		return this.#width;
	}

	/**
	 * @returns {number}
	 */
	get height() {
		return this.#height;
	}

	/**
	 * @param {number} value
	 */
	set width(value) {
		if (this.#width === value) return;
		this.#width = value;
		this.#root.attr('width', value);
		this.dispatchEvent(new AppEvent(AppEventType.RESIZE));
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_WIDTH));
	}

	/**
	 * @param {number} value
	 */
	set height(value) {
		if (this.#height === value) return;
		this.#height = value;
		this.#root.attr('height', value);
		this.dispatchEvent(new AppEvent(AppEventType.RESIZE));
		this.dispatchEvent(new AppEvent(AppEventType.CHANGE_HEIGHT));
	}

	/**
	 * @returns {number}
	 */
	get x() {
		return this.#x;
	}

	/**
	 * @returns {number}
	 */
	get y() {
		return this.#y;
	}

	/**
	 * @param {number} value
	 */
	set x(value) {
		if (this.x === value) return;
		this.#x = value;
		this.#root.attr('x', value);
		this.dispatchEvent(new AppEvent(AppEventType.MOVE));
	}

	/**
	 * @param {number} value
	 */
	set y(value) {
		if (this.#y === value) return;
		this.#y = value;
		this.#root.attr('y', value);
		this.dispatchEvent(new AppEvent(AppEventType.MOVE));
	}

}

export default Sprite;
  `;

</script>

<div class="container-code">
	<span>/src/packages/charts/graphics/Sprite.js</span>
  <CodeBlock {code} />
</div>

<style>
  .container-code {
    width: 100%;
  }
</style>