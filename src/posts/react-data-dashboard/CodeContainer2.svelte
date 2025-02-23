<script>
  import CodeBlock from '../../components/CodeBlock.svelte';
  import Steps from '../../components/Steps.svelte';
  import { arrayRange } from '../../lib/utils.ts'

  let stepsComponent;
  let codeBlockComponent;
  let highlightedLines = {};

  const code = `
const useProcessedData = (dataAll, filters, search) => {
  return useMemo(() => {
    if (!dataAll.data?.length) return [];

    const { years, journals } = filters;
    const [minYear, maxYear] = years;
    const hasJournalFilter = journals.length > 0;
    const hasSearch = search.value !== '';

    return dataAll.data.map(d => {
      const matchesFilters = (
        d.year >= minYear && 
        d.year <= maxYear && 
        (!hasJournalFilter || journals.includes(d.sourcetitle))
      );

      const matchesSearch = hasSearch ? d.label === search.value : true;

      return {
        ...d,
        opacity: (matchesFilters && (matchesSearch || !hasSearch)) ? d.opacity : 0.1,
        interactive: (matchesFilters && (matchesSearch || !hasSearch))
      };
    });
  }, [dataAll.data, filters, search]);
};
  `;

  const steps = [
  {
    title: "Combines multiple filter conditions",
    descriptions: [
      "Year range filtering",
      "Journal filtering",
      "Search filtering",
      "Uses boolean flags to track active filters",
    ],
    lines: arrayRange(10, 15, 1),
    color: '#FF00FF'
  },
  {
    title: "Adjusts entity attributes based on filter matches, for visual emphasis through opacity changes, handled by Nodes component.",
    descriptions: [
    ],
    lines: arrayRange(21, 22, 1),
    color: '#FFD700'
  }
];

  function handleHighlight(event) {
    highlightedLines = event.detail;
  }

  function handleScroll(event) {
    if (codeBlockComponent) {
      codeBlockComponent.scrollToLine(
        event.detail.line, 
        event.detail.stepPosition,
        event.detail.highlightId
      );
    }
  }
</script>

<div class="container-code">
  <CodeBlock 
    bind:this={codeBlockComponent}
    {code} 
    {highlightedLines} 
    {steps} 
    {stepsComponent}
    blockName='src/MainPage'
  />
  <Steps 
    bind:this={stepsComponent}
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