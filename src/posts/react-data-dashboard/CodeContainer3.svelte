<script>
  import CodeBlock from '../../components/CodeBlock.svelte';
  import Steps from '../../components/Steps.svelte';
  import { arrayRange } from '../../lib/utils.ts'

  let code = `
const useMainPageState = () => {
  const [dataAll, setData] = useState({ 
    data: [], 
    journals: [] 
  });
  const [search, setSearch] = useState({ 
    value: ''
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    years: [],
    journals: []
  });
  const [controlsDisabled, setControlsDisabled] = useState(false);

  return {
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
  };
};
  `;

  let codeBlockComponent;
  let highlightedLines = {};

  const steps = [
  {
    title: "Main Data State (dataAll)",
    descriptions: [
      "data: Main array holding the processed paper data",
      "journals: List of all available journals",
      "This state is populated after the initial API fetch"
    ],
    lines: arrayRange(2, 5, 1),
    color: '#FF00FF'
  },
  {
    title: "Search State",
    descriptions: [
      "value: The current search term entered by user",
    ],
    lines: arrayRange(6, 8, 1),
    color: '#FFD700'
  },
  {
    title: "Loading State",
    descriptions: [
      "Simple boolean for tracking initial data loading. Starts as true and switches to false after initial data fetch.",
      "Controls whether to show loading screen or main content",
    ],
    lines: [9],
    color: '#00FFFF'
  },
  {
    title: "Filter State",
    descriptions: [
      "years: Array containing [minYear, maxYear] for year range filter",
      "journals: Array of selected journal names for filtering",
      "Used to filter the visualization"
    ],
    lines: arrayRange(10, 13, 1),
    color: '#BF00FF'
  },
  {
    title: "Controls State",
    descriptions: [
      "Single boolean to track if timeslider and dropdown menus should be disabled, to prevent filter changes while examining specific data",
      "Set to true when a node is selected (clicked) in the visualization",
    ],
    lines: [14],
    color: '#32CD32'
  },
  {
    title: "The hook then returns an object with all state variables and their setters, making them available to the main component.",
    descriptions: [],
    lines: [],
    color: '#FF7F50'
  }
];

  function handleHighlight(event) {
    highlightedLines = event.detail;
  }

  function handleScroll(event) {
    if (codeBlockComponent) {
      codeBlockComponent.scrollToLine(event.detail.line, event.detail.stepPosition);
    }
  }
</script>

<div class="container-code">
  <CodeBlock 
    bind:this={codeBlockComponent}
    {code} 
    {highlightedLines} 
    {steps} 
    blockName='src/MainPage'
    height="760px"
  />
  <Steps 
    {steps} 
    on:highlight={handleHighlight} 
    on:scroll={handleScroll}
  />
</div>

<style>
	.container-code {
		display: flex;
		width: 100%;
		margin: 2.5rem 0rem 3.5rem 0rem;
	}
</style>