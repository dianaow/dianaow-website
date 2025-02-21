<script>
  import CodeBlock from '../../components/CodeBlock.svelte';
  import Steps from '../../components/Steps.svelte';
  import { arrayRange } from '../../lib/utils.ts'

  let code = `
const RadarScatter = React.memo(({ data, search, journals, onNodeClick }) => {
  const positionsRef = useRef(null);
  
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Handle window resize with debouncing
  useEffect(() => {
    const handleResize = _.debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 250);
    
    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const radius = useMemo(() => 
    Math.min(dimensions.width/2, dimensions.height/2) - 60,
    [dimensions]
  );

  // Compute node positions with memoization
  const nodePositions = useMemo(() => {
    if (!data?.length) return [];
    
    // Create a signature for the current data state
    const dataSignature = JSON.stringify({
      data: data.map(d => ({
        entity: d.entity,
        category: d.category,
        count: d.count
      })),
      width: dimensions.width,   // Add window dimensions
      height: dimensions.height  // to the signature
    });
    
    // Return cached positions if data hasn't changed
    if (positionsRef.current?.signature === dataSignature) {
      return positionsRef.current.positions;
    }
  
    // Compute new positions
    const positions = computeNodePositions(data, rScale);
    
    // Cache the results
    positionsRef.current = {
      positions,
      signature: dataSignature
    };
    
    return positions;
  }, [data, rScale]);
  
  // Process radial data
  const radialData = useMemo(() => {
    if (!data?.length || !nodePositions.length) return [];

    fillScale.domain(journals);
    colorScale.domain(journals);

    return data.map((d, i) => ({
      ...d,
      x: nodePositions[i].x,
      y: nodePositions[i].y
    }));
  }, [data, nodePositions, journals]);

  // Memoize accessors
  const accessors = useMemo(() => ({
    key: d => "entity-" + d.entity,
    x: d => d.x,
    y: d => d.y,
    fill: d => fillScale(d.color),
    stroke: d => 'none',
    size: d => d.size,
    opacity: d => d.opacity,
    strokeWidth: 1
  }), []);

  return (
    <div className="Radar">
      <Chart dimensions={dimensions}>
        <g transform={"translate(dimensions.width/2, dimensions.height/2 + 8)"}>
            {..... other components rendered .....}
          <Nodes
            data={radialData} 
            accessors={accessors}
            search={search}
            onNodeClick={onNodeClick}
          />
        </g>
      </Chart>
    </div>
  );
});
  `;

  let codeBlockComponent;
  let highlightedLines = [];

  const steps = [
  {
    title: "Window Resize Handling",
    descriptions: [
      "Updates dimensions state with debouncing for smooth performance",
      "Maintains responsive layout across different screen sizes",
      "Cleans up event listeners on component unmount, to prevent it from holding references to functions, data, and DOM elements even though the component that created them is gone, hindering them from being garbage collected."
    ],
    lines: arrayRange(10, 23, 1),
    color: '#FF00FF'
  },
  {
    title: "Node Position Calculation",
    descriptions: [
      "Transforms data into radial coordinates",
      "Memoizes calculated values to avoid expensive recalculations on every render",
      "Caches results to prevent unnecessary recalculations. New node positions are only computed when certain data properties or window dimensions change."
    ],
    lines: arrayRange(31, 60, 1),
    color: '#FFD700'
  },
  {
    title: "Data Preparation for Visualization",
    descriptions: [
      "Combines computed node positions with original data attributes",
      "Applies scaling functions to determine node sizes and colors",
      "Ensures data is in the correct and final format for the visualization layer",
    ],
    lines: arrayRange(63, 74, 1),
    color: '#00FFFF'
  },
  {
    title: "Accessor Function Configuration",
    descriptions: [
      "Defines consistent methods for accessing node properties (position, color, size)",
      "Handles data mapping for visual attributes like fill colors and opacity, establishing the interface between data and rendering in Nodes component",
    ],
    lines: arrayRange(77, 86, 1),
    color: '#BF00FF'
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
    blockName='src/RadarScatter' 
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