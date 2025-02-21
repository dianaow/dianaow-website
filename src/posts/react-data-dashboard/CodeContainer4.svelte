<script>
  import CodeBlock from '../../components/CodeBlock.svelte';
  import Steps from '../../components/Steps.svelte';
  import { arrayRange } from '../../lib/utils.ts'

  let code = `
const Nodes = React.memo(({ data, accessors, search, onNodeClick }) => {
  const { setTooltip } = useContext(TooltipContext);
  const nodesRef = useRef(null);
  const selectedNodeRef = useRef(null);
  const nodesSelectionRef = useRef(null);

  const showTooltip = useCallback((d) => {
    setTooltip({
      show: true,
      info: d,
    });
  }, [setTooltip]);

  const hideTooltip = useCallback(() => {
    setTooltip(initialTooltipState);
  }, [setTooltip]);

  const updateNodeOpacity = useCallback((selector, opacityValue) => {
    if (!nodesSelectionRef.current) return;
    
    const selection = typeof selector === 'string' 
      ? nodesSelectionRef.current.selectAll(selector)
      : nodesSelectionRef.current.selectAll('circle');
      
    selection.attr('opacity', typeof opacityValue === 'function' 
      ? (d) => opacityValue(d)
      : opacityValue
    );
  }, []);

  const highlightRelatedNodes = useCallback((d) => {
    updateNodeOpacity(null, 0.1);
    if (search.value) {
      // If searching, only highlight the searched node
      updateNodeOpacity(\`.entity-\${d.entity}\`, 1);
    } else {
      // Otherwise highlight all related nodes
      const relatedNodes = data.filter(item => item.unitID === d.unitID);
      relatedNodes.forEach(node => {
        updateNodeOpacity(\`.entity-\${node.entity}\`, 1);
      });
    }
  }, [data, updateNodeOpacity, search.value]);

  const eventHandlers = useMemo(() => ({
    handleNodeClick: (event, d) => {
      // Only allow interaction with nodes that are marked as interactive
      if (!d.interactive) return;
      
      const wasSelected = selectedNodeRef.current === d.entity;
      selectedNodeRef.current = wasSelected ? null : d.entity;

      // Notify parent component about selection state
      onNodeClick?.(!wasSelected);

      if (!wasSelected) {
        highlightRelatedNodes(d);
        showTooltip(d);
      } else {
        updateNodeOpacity(null, (d) => callAccessor(accessors.opacity, d));
        hideTooltip();
      }

      event.stopPropagation();
    },

    handleMouseOver: _.debounce((event, d) => {
      // Only allow interaction with nodes that are marked as interactive
      if (!d.interactive) return;
      
      // If a node is selected, only show tooltip for selected node
      if (selectedNodeRef.current && d.entity !== selectedNodeRef.current) return;
      
      highlightRelatedNodes(d);
      showTooltip(d);
    }, 50),

    handleMouseOut: _.debounce(() => {
      // Don't reset highlight if we have a selected node
      if (selectedNodeRef.current) return;

      updateNodeOpacity(null, (d) => callAccessor(accessors.opacity, d));
      hideTooltip();
    }, 50)
  }), [
    accessors.opacity, 
    highlightRelatedNodes, 
    updateNodeOpacity,
    showTooltip,
    hideTooltip,
    onNodeClick
  ]);

  useEffect(() => {
    if (!data?.length || !nodesRef.current) return;

    const svg = d3.select(nodesRef.current);
    nodesSelectionRef.current = svg;
    
    // Clear previous nodes
    svg.selectAll('*').remove();

    // Create nodes with D3 enter/update/exit pattern
    const nodes = svg
      .selectAll("circle")
      .data(data, d => d.entity)
      .join('circle')
      .attr('class', d => \`.entity-\${d.entity}\`)
      .attr('cx', (d, i) => callAccessor(accessors.x, d, i))
      .attr('cy', (d, i) => callAccessor(accessors.y, d, i))
      .attr('r', (d, i) => callAccessor(accessors.size, d, i))
      .attr('fill', (d, i) => callAccessor(accessors.fill, d, i))
      .attr('stroke', (d, i) => callAccessor(accessors.stroke, d, i))
      .attr('opacity', (d, i) => callAccessor(accessors.opacity, d, i))
      .attr('stroke-width', accessors.strokeWidth)
      .style('cursor', d => d.interactive ? 'pointer' : 'default');

    // Add event listeners
    nodes
      .on('click', eventHandlers.handleNodeClick)
      .on('mouseover', eventHandlers.handleMouseOver)
      .on('mouseout', eventHandlers.handleMouseOut);

    return () => {
      selectedNodeRef.current = null;
      nodesSelectionRef.current = null;
      eventHandlers.handleMouseOver.cancel();
      eventHandlers.handleMouseOut.cancel();
    };
  }, [data, accessors, eventHandlers]);

  return (
    <g className="Radar__Elements">
      <g className="Nodes" ref={nodesRef} />
      <Tooltip/>
    </g>
  );
});
  `;

  let codeBlockComponent;
  let highlightedLines = [];

  const steps = [
  {
    title: "nodesRef",
    descriptions: [
      "This ref holds a reference to the actual SVG group element (<g>) in the DOM",
      "It's crucial for D3 integration because it provides the entry point for D3 to manipulate the DOM",
      "Using a ref here instead of querying the DOM (like document.querySelector) ensures we're always working with the correct element. The ref persists across re-renders while maintaining the same reference to the DOM element"
    ],
    lines: [3, 134],
    color: '#FF00FF'
  },
  {
    title: "selectedNodeRef",
    descriptions: [
      "Tracks which node is currently selected by storing the entity ID of the selected node, influencing event handlers.",
      "Using useRef instead of useState here is a key optimization because we don't want to trigger re-renders when selection changes as the selection state is only used for internal logic (highlighting and tooltip behavior)"
    ],
    lines: [4],
    color: '#FFD700'
  },
  {
    title: "nodesSelectionRef",
    descriptions: [
      "Holds the D3 selection object for the nodes container",
      "Persists the D3 selection across renders to avoid recreating it",
      "Enables efficient updates to node properties without re-selecting elements"
    ],
    lines: [5, 19, 22, 23, 98],
    color: '#00FFFF'
  },
  {
    title: "Event Handlers",
    descriptions: [
      "Event handlers are encapsulated in a single useMemo function as they share the same set of dependencies.",
      "Reduces the number of memoized values React needs to track with a single memory allocation for all handlers",
    ],
    lines: [45],
    color: '#BF00FF'
  },
  {
    title: "Click event",
    descriptions: [
      "If there are filters in place, only filtered nodes can be interacted with. Hence, the need to set an 'interactive' flag to decide whether or not to ignore the click event",
      "Checks if this node was already selected through a prior click event, and manages selection state and actions accordingly.",
      "Parent component (MainPage) is notified of selection change via `onNodeClick` callback, enabling or disabling the dropdown menus and timeslider.",
    ],
    lines: arrayRange(46, 65, 1),
    color: '#32CD32'
  },
  {
    title: "Mouseover event",
    descriptions: [
      "If the mouse cursor is over a node, highlights related nodes using `highlightRelatedNodes` and shows the tooltip.",
      "It has special behavior when a node is selected: If there is a selected node (selectedNodeRef.current) and this is not that node (d.entity !== selectedNodeRef.current), then the hover is ignored.",
    ],
    lines: arrayRange(67, 76, 1),
    color: '#FF7F50'
  },
  {
    title: "Mouseout event",
    descriptions: [
      "When the mouse cursor leaves the node, resets all nodes to their default opacity and hides the tooltip."
    ],
    lines: arrayRange(78, 84, 1),
    color: '#0066FF'
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
    blockName='src/Nodes'
    height="1400px"
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