---
title: Implementing Retrieval-Augmented Generation (RAG) with Knowledge Graph
description: Use a KG, with its structured and unstructured parts, to augment an LLM response to enhance it's accuracy
date: '2024-2-6'
categories:
  - Python
  - OpenAI (free tier)
  - LangChain
  - Neo4j
published: true
---

<br/><br/>

## Using Object-Oriented Programming (OOP) concepts in JavaScript for building a data dashboard offers several advantages, especially for a complex application involving multiple charts. 
Here are the key reasons why OOP is beneficial in this context:

### Modularity
Encapsulation:
- Encapsulation means bundling the data (properties) and the methods (functions) that operate on the data within a single unit (class).
- Example: Each chart can be an instance of a class with its own properties and methods, encapsulating all the functionalities related to that specific chart.

### Reusability
Class Inheritance:
- Inheritance allows a class to inherit properties and methods from another class.
- Example: A base Chart class can be extended by specific types of charts (e.g., BarChart, LineChart), reusing common functionalities while allowing customization.

### Maintainability
Single Responsibility Principle (SRP):
- By adhering to SRP, each class has a single responsibility, making the codebase easier to maintain and extend.
- Example: Separate classes for data loading (ChartDataLoader), event handling (EventDispatcher), and rendering (GraphView) ensure that changes in one part of the application do not affect others.

### Scalability
Complexity Management:
- As data dashboards often need to handle a variety of charts and dynamic data updates, OOP helps manage this complexity through well-defined class structures and interactions.
- Example: A ChartContext class can manage the state and configuration of multiple charts, making it easier to scale the application by adding new chart types or data sources.

### Flexibility
Polymorphism:
- Polymorphism allows objects of different classes to be treated as objects of a common super class. This is particularly useful for operations that can be applied to multiple types of charts.
- Example: A method to update the chart view can be written in a way that it applies to any type of chart, whether it’s a bar chart or a line chart, as long as they inherit from a common Chart class.

### Readability and Collaboration
Clear Structure and Documentation:
- OOP promotes a clear and logical structure, making the code more readable and easier for teams to collaborate on.
- Example: Using descriptive class names and methods (e.g., addChild, removeChild, updateView) makes the purpose of each part of the code evident, facilitating better communication among developers.


## Specific Importance for a Data Dashboard with Many Charts
### Consistency:
- Ensuring a consistent look and feel across multiple charts is easier when they share a common base class or set of methods.
- Example: All charts can inherit common styling and interaction methods from a parent Chart class.

### Dynamic Data Handling:
- Data dashboards often require frequent updates and interactions. OOP makes it easier to handle dynamic data updates efficiently.
- Example: A ChartDataLoader class can be responsible for fetching and updating data, ensuring that all charts update consistently when data changes.

### Interactivity and Events:
- Complex dashboards require handling numerous user interactions (e.g., clicks, hover events). Using an event-driven approach with an EventDispatcher class helps manage these interactions systematically.
- Example: Each chart can register event listeners for user interactions, ensuring that events are handled in a structured manner.

### Modular Development:
- Large dashboards benefit from a modular approach where different developers can work on different chart types or components simultaneously without  conflicts.
- Example: One developer can work on a BarChart class while another works on a LineChart class, both extending a common Chart class.

By leveraging OOP principles, you can create a data dashboard that is not only robust and maintainable but also scalable and flexible enough to accommodate future requirements and enhancements


## App Flowchart


## Subscription model
The subscription model is used to manage state changes and communication between different parts of an application. The subscription model involves objects (subscribers) registering interest in specific events or changes to another object (publisher). When the publisher changes, it notifies all subscribed objects, allowing them to react accordingly.

#### Purpose:
- Event Listening: Subscribers listen for specific events or state changes.
- Decoupling: Reduces direct dependencies between components, making the system more modular.
- Reactivity: Ensures that components automatically update in response to relevant changes.

```javascript (ChartContext.js)
  subscribe(storeName, handler) {
      // Create object for given store name to store handlers.
      this.#ownSubscribes[storeName] = this.#ownSubscribes[storeName] || new Map();

      // Exit if handler is already assigned to given store. Ensures that the same handler isn’t subscribed multiple times to the same store.
      if (this.#ownSubscribes[storeName].has(handler)) {
          return;
      }

      // Subscribe and store unsubscription function.
      this.#ownSubscribes[storeName].set(handler, this.store(storeName).subscribe(handler));

      // Return unsubscribe function.
      return this.#ownSubscribes[storeName].get(handler);
  }
```

### Detailed breakdown of subscribe method
```javascript
  this.#ownSubscribes[storeName].set(handler, this.store(storeName).subscribe(handler));  
```

`#ownSubscribes` is a private property of the class that stores subscriptions. It is a dictionary where each key is a store name, and the value is another map that holds handlers (callbacks) and their corresponding unsubscription functions. 

#### Purpose:
- **Tracking Subscriptions**: Knowing which handlers are subscribed to which stores.
- **Unsubscribing Efficiently**: When a chart is removed or reconfigured, you can efficiently unsubscribe the handlers to avoid memory leaks and unexpected behavior.

The `store` method retrieves the **AppStore** instance associated with storeName.
The subscribe method of the AppStore class is called with handler as the argument. This method registers the handler to be called whenever the store's value changes (ie. when the private setValue method gets triggered). 

#### It's called in two main scenarios:
- **When the public value setter is used:** The value setter provides a more intuitive way to update the store's value. When you assign a new value to the value property, it triggers the #setValue method.
- ** When the public set method is used: ** The set method is an alias for the value setter.


```javascript (AppStore.js)
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
```


There is a set method in the Chart Context class that sets the value for the store. This is an alias for `this.store(name).set(value)`.


```javascript (ChartContext.js)
	/**
	 * Set store value.
	 * Alias for this.store(name).set(value)
	 * @param {string} name - store name.
	 * @param {*} value - value to set.
	 */
	set(name, value) {
		// Clone data field objects if it is registered as own value of this context.
		if (name === ChartOption.DATA_FIELD && Array.isArray(value) && this.itsOwnProperty(name)) {
			this.store(name).set(value.map(ctx => ctx.clone()));
		} else {
			this.store(name).set(value);
		}
	}
```

### Example usage:
When a new value is set for the CHART_VIEW property, the callback is triggered because of the subscription
```javascript
  context.subscribe('CHART_VIEW', () => {
    console.log('action to take when CHART_VIEW values changes')
  })
```

## Chart Context
The Chart Context class centralizes the management of chart properties using stores. By initializing stores within the context, it ensures that all state changes are managed consistently and efficiently.

### Purpose:
- Manage Charts: Keep track of all the charts, allowing for easy addition, removal, and updates.
- Coordinate Updates: Update configurations and data for all charts from a single place. For example, it sets up and propagate global configurations for all charts, such as default styles or themes.
- Uniform Behavior: Ensure that all charts adhere to certain standards or behaviors.


```javascript (ChartContext.js)
this.#stores = this.#allProperties.reduce((acc, curr) => {
    acc[curr] = {
        store: new ChartContextStore(this.#defaultValues[curr]),
        ownValue: initialValues.hasOwnProperty(curr) || this.#alwaysOwnProperties.has(curr) || initlAll,
    };

    // Freeze always own stores.
    if (this.#alwaysOwnProperties.has(curr)) {
        Object.freeze(acc[curr]);
    }

    return acc;
}, {});
```

Each property gets its own store, initialized with a default value.
`ownValue` determines if the store's value is local to the context or inherited from a parent context.
As mentioned in the section about subscriptions above, subscriptions ensure that changes in store values are propagated correctly.

## Event listeners

## Building the dashboard with Svelte
A new chart context is initialized with the global context settings. This is then passed down to the child components where are a toolbar representing a panel of buttons which causes changes to the charts, and the page section consisting of the charts.

### Starting point
```svelte
<script>
	import DashboardCharts from '../DashboardCharts.svelte';
	import DashboardToolbar from '../DashboardToolbar.svelte';

	import ChartContext from '@/packages/data/ChartContext';

	import { getContext } from '@/packages/data/stores/trending';
	
	const context = getContext(ChartContext.GLOBAL);

	// Create page-specific context
	const pageRootContext = new ChartContext(context);
</script>

<DashboardToolbar context={pageRootContext} />
<DashboardCharts context={pageRootContext} />
```

A new chart context is initialized with the parent context. This is meant to localize the context to the component. The local context is destroyed when the component is destroyed and thus break all connections with the component that we no longer need.

A new ChartModule instance is initialized, which displays a chart based on the chart context. 

#### DashboardCharts component
```svelte (DashboardCharts.svelte)
<script>
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
</script>

<div class="chart">
	<div class="plot-container" bind:this={targetEl} />
</div>
```

The ChartModule is responsible for rendering the body of the chart, based on assigned dimensions and coordinates. It then initalizes another class called  `SingleViewChart`

#### ChartModule class
```svelte (ChartModule.js)
export default class ChartModule extends InteractiveChartBase {
	#chartBody = null;
	#dataAutoLoad = true;

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

			// Set listeners.
			this.#chartBody.addEventListener(AppEventType.DATA_UPDATED, e => this.dispatchEvent(e));

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
```