---
title: Building a Data Visualization Dashboard with React and D3.js
description: Demonstrates React patterns and best practices for building an interactive data dashboard
date: '2025-2-21'
categories:
  - React
  - D3.js
published: true
---

<script lang="ts">
  import CodeContainer1 from './CodeContainer1.svelte';
  import CodeContainer2 from './CodeContainer2.svelte';
  import CodeContainer3 from './CodeContainer3.svelte';
  import CodeContainer4 from './CodeContainer4.svelte';
  import VideoPlaceholder from '../../components/VideoPlaceholder.svelte';
  import avos_video from "./videos/a-tool-demo.mov";
  import avos_thumbnail from "./images/a-tool.png"
</script>

<VideoPlaceholder>

<br/><br/>

In this post, we'll explore the implementation of an interactive React dashboard that visualizes data of hundreds of research papers. This dashboard demonstrates several React patterns and best practices that you can apply to your own projects.

### The Big Picture
The dashboard has the following key features:

- Radar scatter plot visualization
- Allows users to filter papers by year range using a slider
- Provides journal filtering through a dropdown menu
- Implements paper search functionality
- Enables users to select and focus on specific papers
- Tabular data display
- Responsive tooltip system

<br/>

The dashboard has the following React components, in hierarchical order:
- [MainPage Component](#mainpage-component)
- [RadarScatter Component](#radarscatter-component)
- [Nodes Component](#nodes-component)

<br/><br/>

<div class="video-container" data-src={avos_video}>
  <img
    id="placeholder_image"
    src={avos_thumbnail}
    fetchpriority="high"
    alt="Placeholder Image"
  />
</div>  

## MainPage Component
The MainPage component is responsible for data management:
- Fetches research paper data from an API
- Manages multiple states like loading, filtering, and search
- Sends the transformed and filtered data to RadarScatter component

It also renders UI components like a slider, dropdown and table.

<br/>

```jsx
const MainPage = () => {
  const {
    dataAll,
    setData,
    search,
    setSearch,
    loading,
    setLoading,
    filters,
    setFilters,
    controlsDisabled,
    setControlsDisabled
  } = useMainPageState();

  const processedData = useProcessedData(dataAll, filters, search);
  const memoizedJournals = useMemo(() => dataAll.journals, [dataAll.journals]);

  // Initialize year range from data
  useEffect(() => {
    if (dataAll.data?.length && !filters.years.length) {
      const [minYear, maxYear] = calculateYearRange(dataAll.data);
      setFilters(prev => ({
        ...prev,
        years: [minYear, maxYear]
      }));
    }
  }, [dataAll.data]);

  // Handlers
  const handleYearChange = useCallback((lower, upper) => {
    setFilters(prev => ({
      ...prev,
      years: [lower, upper]
    }));
  }, []);

  const handleJournalChange = useCallback((_, { value }) => {
    setFilters(prev => ({
      ...prev,
      journals: value
    }));
  }, []);

  const handleSearchChange = useCallback(
    _.debounce((_, { value }) => {
      setSearch({
        value
      });

      // Reset node selection when search is cleared
      if (!value) {
        setControlsDisabled(false);
      } 
    }, 300),

    [controlsDisabled]
  );

  const handleNodeClick = useCallback((isSelected) => {
    setControlsDisabled(isSelected); // Disable dropdown and timeslider when a node is clicked
  }, []);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/data`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        if (!result.papers || !result.scores) {
          throw new Error('Invalid data structure');
        }

        const transformedData = transformData(
          result.scores,
          result.papers
        );

        setData(transformedData);
      } catch (error) {
        console.error('Data fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dropdown menu items for Journals
  const journalOptions = useMemo(() => (
    dataAll.data
      ?.map(d => d.sourcetitle)
      .filter(onlyUnique)
      .map(d => ({
        key: d,
        text: d,
        value: d
      }))
      .sort((a, b) => d3.ascending(a.key, b.key))
  ), [dataAll.data]);

  // Dropdown menu items for Papers
  const searchOptions = useMemo(() => {
    if (!dataAll.data?.length || !filters.years.length) {
      return [];
    }
    // Narrow down searchable papers based on filters
    return calculateSearchOptions(dataAll.data, filters); 
  }, [dataAll.data, filters]);

  if (loading) {
    return (
      <h1>Loading...</h1>
    )
  }

  if (!processedData.length) {
    return null;
  }

  return (
    <TooltipProvider>
      <Header />
      <div className="App__wrapper">
        <div className='App_container'>
          <div className='SideBarLeft'>
            <Slider 
              changeThresholds={handleYearChange}
              active={!controlsDisabled}
              range={calculateYearRange(dataAll.data)}
              value={filters.years}
            />
            <div className="Search">
              <h3>Search for a paper</h3>
              <Dropdown
                placeholder=''
                fluid
                search
                selection
                clearable
                options={searchOptions}
                onChange={handleSearchChange}
                value={search.value}
                disabled={controlsDisabled}
              />
            </div>
            <div className="Search">
              <h3>
                Filter by Journal
              </h3>
              <Dropdown
                placeholder=''
                fluid
                multiple
                search
                selection
                options={journalOptions}
                onChange={handleJournalChange}
                value={filters.journals}
                disabled={controlsDisabled || !!search.value}
              />
            </div>
            <Table data={processedData} search={search} />
          </div>

          <div className='Main'>
            <RadarScatter
              data={processedData}
              search={search}
              journals={memoizedJournals}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
```

### Custom Hook Pattern
One of the patterns used in this component is the separation of concerns using custom hooks, such as `useMainPageState`.

#### Code Organization and Readability
- Even without reuse, the hook separates state management logic from the component's rendering logic
- This makes the MainPage component cleaner and more focused on its layout and composition
- Instead of seeing so many useState declarations at the top of MainPage, you get one clear hook call

#### Maintenance and Documentation
- The hook acts as a form of self-documentation - it clearly shows all the state that the page needs
- When another developer needs to modify the state, they have one clear place to look
- It's easier to see state dependencies when they're grouped together

<CodeContainer3></CodeContainer3>

### Data Processing with useMemo
`useMemo` caches the processed data, ensuring that expensive data transformations only occur when dependencies change, not on every render. This prevents unnecessary processing on every render.

`useProcessedData` is triggered on initial data load, after search for a paper or after filtering by year or journal.

<CodeContainer2></CodeContainer2>

### Event Handlers with useCallback

Why use useCallback here? There are several reasons:

#### Debounce Stability
- Without useCallback, a new debounced function would be created on every render
- Each new function would have its own debounce timer. This could lead to unpredictable behavior and memory leaks

#### Reference Stability
- The callback is passed to a Dropdown component
- Stable references help prevent unnecessary re-renders of child components

#### Dependency Management
- useCallback ensures the function only recreates when this dependency changes

```javascript
const handleSearchChange = useCallback(
    _.debounce((_, { value }) => {
      setSearch({
        value
      });

      // When search is cleared, enable interaction with journal dropdown again
      if (!value) {
        setControlsDisabled(false);
      } 
    }, 300),
    []
);
```

`handleSearchChange` is triggered whenever a user searches for a paper and selects a value from the dropdown.
The debounce wrapper ensures the search only triggers 300ms after the user stops typing. This prevents excessive state updates while the user is still typing.

### Connection to RadarScatter component
When any of these dependencies (dataAll.data, filters, search) change:
- React detects the change because they're listed in the dependency array
- This triggers useMemo to recalculate because its dependencies changed
- `useProcessedData` runs again to create new `processedData`

`const processedData = useProcessedData(dataAll, filters, search);`

`processedData` is passed to RadarScatter component, which further transforms it into radial coordinates for the visualization. Finally, the transformed data is rendered through the Nodes component

```jsx
  <RadarScatter
    data={processedData}
    search={search}
    journals={memoizedJournals}
    onNodeClick={handleNodeClick}
  />
```

## RadarScatter component

This component contains a data transformation pipeline to transform  data of research papers into the final format needed for visualization by the Node component. It also renders pheripheral components like the chat axis, labels, and radial background.

You may view the full RadarScatter component code [here](https://github.com/dianaow/avos-tool/blob/main/client/src/components/Main/RadarScatter.js "RadarScatter") 

<CodeContainer1></CodeContainer1>

## Nodes component

The Nodes component renders interactive circular nodes in an SVG, complete with hover effects, click interactions, and tooltip. It is particularly useful for network graphs, scatter plots, or any visualization requiring interactive circular elements.

These are the following interactive features:
- On mouseover of a node, it and related nodes sharing the same paper ID are highlighted. A tooltip containing information of the node is shown. Mouseout will revert the action and hide the tooltip.
- Clicking on a node will maintain the mouseover action, whilst preventing mouseout action from happening. Clicking the same node again will revert the action.
- On filtering of data through the slider or dropdown, these filtered entities are highlighted and interactive. All other non-highlighted nodes have no interactivity. On cancellation of the filtered state, then all entities are interactivity again.
- Time slider and dropdown menus are disabled after a node is clicked.

In this component, you will see `useMemo`, `useCallback` and `useRef` in action.

<CodeContainer4></CodeContainer4>

> **Key Differences between useCallback and useMemo**
> 
> **What they memoize:**
> - `useCallback` memoizes a function definition
> - `useMemo` memoizes the result of calling a function
> 
> **Return value:**
> - `useCallback(fn, deps)` returns the function fn itself
> - `useMemo(() => value, deps)` returns the value returned by the callback
> 
> **Use cases:**
> - `useCallback` is for function stability (reference equality)
> - `useMemo` is for value computation optimization
>
> They both accept dependency arrays and only recompute when dependencies change.

## Conclusion 

These React components have evolved through multiple iterations. I originally built this dashboard nearly two years ago for a client and was later asked to update it with a new dataset. Revisiting the code, I took the opportunity to conduct a full review and refactor, applying the skills I’ve since gained in React. You can compare the [updated code](https://github.com/dianaow/avos-tool/tree/main/client) with the [original](https://github.com/dianaow/sustainability-marketing-research-map).

This article showcases integration of React and D3, demonstrating best practices for building interactive data visualizations. It provides a solid foundation for building complex node-based visualizations while maintaining good performance and code maintainability.

<br/><br/>

</VideoPlaceholder>