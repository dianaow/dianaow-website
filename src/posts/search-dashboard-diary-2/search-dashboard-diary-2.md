---
title: Weekly Diary 2 & 3 - Next.js app with data dashboard
description: A weekly diary to document the design and development process of a web application
date: '2024-9-5'
categories:
  - Nextjs
  - Tailwind CSS
published: true
thumbnail_url: ""
---

<script lang="ts">
  import NETWORK_TIMELINE_PLAY from './videos/NETWORK_TIMELINE_PLAY.mp4'
  import NETWORK_TIMELINE_HOVER from './videos/NETWORK_TIMELINE_HOVER.mp4'
  import NETWORK_EXPAND_RESET from './videos/NETWORK_EXPAND_RESET.mp4'
  import NETWORK_TIMELINE_ERROR from './videos/NETWORK_TIMELINE_ERROR.mp4'
  import search_page from './images/search_page.png'
</script>

I have been building many MVPs and prototypes for clients from the ground up that I have decided to document/share my creation process of one such project in the form of a weekly diary. This is my work dairy for the challenging Week 2 of the project, which eventually stretched on to a third week.

# Work Done

## Search Form & Results

After the first week's review, the client provided feedback that there isn't a need to display all search result information at once, and suggested tabs at the left side to show each table one at a time.

I also had to implement a *search filtering logic* across the mock datasets based on multiple text fields. Datasets can also be excluded from the search through the checkboxes. The search results are shown below the form as a Tab component. Tab labels and each tab content are dynamically set. Because I had already compartmentalized each returned result into a Table component, it became less of a hassle to completely rewrite the code representing the search results section. 

Clicking on the tab at the top reveals more information specific to the searched entity only, represented as tables again. It also renders a button that when clicked, redirect the users to a network visualization dashboard specific to that entity. 

<figure>
  <img src={search_page} alt="Search page new"/>
</figure>

## Creating API routes

During the first week, I simply imported data to the Next.js component client-side like this.

`import { entities, relationships } from '@/app/lib/network/data.js';`

<br/>

This week, I created API routes in the application using Next.js App Router to dynamically extract data from specific local folders. 

Here are the steps I took:
1. I converted all existing Javascript data files to JSON format. 
2. I created a folder named after each entity and transfer all JSON files belonging to that entity inside it.
3. I created a folder to store JSON files which will only be used during the search. These files are termed global datasets.
4. I created an API route in the `app/api/data` directory. Inside `route.js` file is a GET request, using the `fs` module to read files from a local folder containing the global datasets. This route is useful to fetch data from the search page to be filtered based on the form submission details.

<br/>

```javascript (app/search/page.jsx)
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/data`);
      const result = await response.json();

      const { global_data1, global_data2 } = result;
      
      setDocuments({
        'data1': global_data1,
        'data2': global_data2
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
```

4. I created `app/api/[name]/route.js` where `[name]` is a dynamic parameter that can be replaced by "company1", "company2", etc. Inside this file is a GET request, using the `fs` module to read files from a local folder dynamically based on the name parameter. This route is useful to fetch data from the entity's dashboard page.


```javascript (app/dashboard/[name]/page.jsx)
  const fetchData = async () => {
    const response = await fetch(`/api/${name}`);
    const result = await response.json();
    setData(result);
  };
```

I believe this pattern is valuable during the prototype phase, allowing for a flexible flow of data into the user interface, especially when a database is not yet set up. Additionally, fetching data server-side is advantageous compared to importing multiple large files client-side. The GET request code can easily be modified later to connect to a database if needed.

## Network Visualization Dashboard

It is time to integrate a timeline component to the network visualization. To do this, I will create a `NetworkTimeline` component and migrate all the code relevant to the network viz from the `Dashboard` component inside. The  `NetworkTimeline` component is a child of the `Dashboard` component.

### Interaction features to implement:
1. *Timeline* 
  - Unlike a typical timeline of regular date intervals, only ticks representing an event date will be shown. 
  - When a new timestamp is selected, the entire network smoothly transitions into their new coordinates.

<br/>

2. *Right-Click Context Menu*
  - Upon right-clicking the root node, a context menu appears with an 'Expand' option. 
  - Selecting 'Expand' will reveal the remaining layers of connections within the existing graph at the selected timestamp, regardless of edge direction.

<br/>

3. *Merge of Transaction records*
  - There are two different datasets which are merged into a single network. One is the connection of other entities to the searched entity, and the second is a dataset of transactions that have to be processed to fit the same graph structure as the first dataset. 
  - This transactions sub-graph is styled differently.

<br/>

4. *Node Click*
  - When a node with a certain attribute is clicked, other components on the dashboard page respond by updating dynamically.

<br/>

5. *Drag/Reset* 
  - All nodes can be dragged around, but on release they are fixed at that position. 
  - Clicking the 'Reset' button will re-arrange all nodes and links into their original positions. Reset also undos the outcome of the expand action. 

<br/><br/>

The network generating function `ForceGraph` is decoupled from the timeline and provides a public `update` method. This method is called whenever there is a need to update the graph with changed data, such as when a new timestamp is selected from the timeline.

I also attached event listeners to all visible nodes. These listeners will trigger the appropriate event subscription methods when the corresponding actions occur. I am utiliziing Javascript's *publisher-subscriber pattern* here.

```javascript (/charts/network/index.js)
  function ForceGraph(
    {
      nodes, // an iterable of node objects (typically [{id}, …])
      links // an iterable of link objects (typically [{source, target}, …])
    },
    {
      containerSelector,
      nodeId = 'id',
      sourceId = 'source',
      targetId = 'target',
      // ...rest of input parameters to configure the graph
    }
  ) {
  
    function updateAttributes() {
      // code to assign properties such as colors, radius, x, y coordinates to each node and relationship
    }

    function updateLayout() {
      // code to redraw each node and relationship
    }

    const eventSubscriptions = {
      nodeClick: null,
      expand: null
    };

    // Function to reapply event listeners to nodes
    const reapplyEventListeners = () => {
      if (eventSubscriptions.nodeClick) {
        d3.selectAll('.node').on('click', function (event, d) {
          eventSubscriptions.nodeClick({
            clickedNodeData: d,
          });
        });
      }

      if(eventSubscriptions.expand) {
        // Select all '.node' elements and add a right-click event listener
        d3.selectAll('.node').on('contextmenu', function (event, d) {
          // Prevent the default browser context menu from appearing
          event.preventDefault();

          // ...Code to create a new context menu at the mouse position....

          // Add 'Expand' option to the context menu
          menu.append('div')
            .text('Expand')
            .on('click', function () {
              // Trigger the expand action
              eventSubscriptions.expand({
                clickedNodeData: d,
              });

              // Remove the menu after clicking the item
              menu.remove();
            });
        });
      }
    };

    /* public methods */
    return {
      update: function({nodes, links}) {
        // Update logic for new data...
        updateAttributes(nodes, links)
        updateLayout()
        reapplyEventListeners();
      },
      /* event subscription method, provides interface for graph specific events e.g. click on node */
      on: (eventName, callback) => {
        if (eventName === 'nodeClick') {
          eventSubscriptions.nodeClick = callback;
        }
        if (eventName === 'expand') {
          eventSubscriptions.expand = callback;
        }
        // Apply the event listener to the current nodes
        reapplyEventListeners();
      }
    }
  }
```

Since the dataset is structured as a *timeseries*, rendering a snapshot of the network at a specific point in time requires filtering the original dataset of entities and relationships based on the timestamp stored in `currentDate`. It is then further filtered to display only connections that are up to a specified degree away from the root node. Finally, the transaction records are processed and merged. I encapsulate all this in a `dataProcessing` function as it will be repeatedly used in the `NetworkTimeline` component.

```javascript (NetworkTimeline.js)
  function dataProcessing(entities, relationships, transactions, currentDate, maxDegree) {
    const rootNode = entities.find(d => d.Root)
    const filteredLinks = filterTimeSeriesData(relationships, currentDate);
    const filteredNodes = filterEntities(entities, filteredLinks);
    const {nodes: nodesN, links: linksN} = getNeighborsAtNDegree(filteredNodes, filteredLinks, rootNode.Entity, maxDegree)
    const {nodes, links}= appendTransactions(nodesN, linksN, transactions)
    
    return {nodes, links}
  }
```

In the `NetworkTimeline` component, the `ForceGraph` function is initialized once with this post-processed set of nodes and links, along with predefined configuration settings. Each element (node, edge, label) has their own default setting, but can be overwritten during initialization.

Whenever `currentDate` changes or 'Expand' action is triggered, the original dataset is filtered again through `dataProcessing` and update method (`graph.current.update`) is triggered with a new set of nodes and links.

```javascript (NetworkTimeline.js)
  const graph = useRef(null);
  const [currentDate, setCurrentDate] = useState(lastDate);

  useEffect(() => {
    if(width <= 0) return
 
    const {nodes, links} = dataProcessing(entities, relationships, transaction_viewer, currentDate, 1)

    if (graph.current) {
      graph.current.update({ nodes, links });
    } else {
      graph.current = ForceGraph(
        { nodes, links },
        {
          containerSelector: "#network",
          nodeId: "Entity",
          sourceId: "Source",
          targetId: "Target",
          width: width * 0.82,
          height: height - 160,
          containerStyles: {
            theme: 'light',
          },
          labelStyles: {
            visibility: 'visible',
            label: "Entity",
            edge: {
              visibility: 'visible',
              label: "Relationship"
            }
          },
          nodeStyles: {
            colorSrc: "links", // choose if the column to assign color of node comes from nodes or links dataset. For timeline, the color is assigned from the timestamped links dataset (eg. different risk values over time).
          },
          linkStyles: {
            colors : {
              "#d4d4d4": 0,
              "#60d394": 1,
              "#aaf683": 2,
              "#ffd97d": 3,
              "#ff9b85": 4,
              "#ee6055": 5
            }, // color assignment determined by colorAttr. if data doesn't have any values (eg 0-5), then link defaults to gray
            colorAttr: 'Value',  // column name in data used to assign color of node. if data doesn't have this attribute, then link defaults to gray
            strokeWidth: 'Amount', // column name in data used to assign link thickness. if data doesn't have this attribute, then link defaults to 3px
          }
        }
      );

      graph.current.on('nodeClick', async (event) => {
        if(event.clickedNodeData.Type === 'Address') {
            const address = event.clickedNodeData.Entity
            onAddressClick(address); // Send the address to the parent component
        }
      })

      graph.current.on('expand', async (event) => {
        // extract up to 5 layers of nodes/linkages
        const {nodes, links} = dataProcessing(entities, relationships, transaction_viewer, currentDate, 5)
 
        graph.current.update({
          nodes,
          links
        })
      })

    }

  }, [currentDate, relationships, entities, width, height]);
```

> Tip: Use Graphology's javascript library for convenient access to graph theory algorithms and common utilities such as graph attributes, traversals. For example, I used the `forEachNeigbour` method in the `getNeighborsAtNDegree` function.


## Transition effect: Coordinates calculation

Each update results in an unsightly jump of nodes as they move to their new coordinates, due to the simulation restarting and running continuously with every change. I decided to then reference another project of mine, from years ago, where I managed to acheive a desirable smooth transition effect. On initialization, pre-calculate all coordinates by finishing the simulation before render, then store this set of coordinates as x0 and y0 attributes. These x0-y0 coordinates are then used to render a static graph initially. 

```javascript (/charts/network/index.js)
  function updateLayout () {
    simulation.nodes(nodes).force('link').links(links)
    simulation.alphaTarget(0.1).restart() 
    simulation.tick(Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())))

    nodes.forEach((d,i) => {
      d.x0 = d.x
      d.y0 = d.y    
    })

    // rest of code
    // .......
  }
```


When`currentDate` changes, the `useEffect` hook is triggered again, Inside `ForceGraph` function, the simulation is reheated to account for the newly added nodes, and all nodes are re-laid out because of the updated data. To manage the transitions, capture these set of coordinates as x0 and y0 attributes, so that new nodes enter at these initial coordinates, while existing nodes move to their updated x-y positions. This approach reduces the visual jump but still allows existing nodes to shift positions excessively across different timestamps, sometimes crossing over the root node. The focus, however, should remain on the entering nodes.

<br/>

<video width="100%" controls>
  <source src={NETWORK_TIMELINE_ERROR} type="video/mp4">
  Your browser does not support the video tag.
</video>

<br/>

Initially, the page loads a snapshot of the graph at the final timestamp in the list of events. Here’s the key: outside of the `useEffect` hook, filter the nodes based on this final timestamp and run the simulation on these nodes (`nodesLast`) to calculate their x-y coordinates. When `useEffect` runs, reference `nodesLast` to match and assign coordinates to the filtered nodes. If there are no matching nodes due to differences between the final timestamp and `currentDate`, it’s not an issue. The simulation will recalculate all node positions during reheating. However, since the nodes already have initial coordinates, the simulation will adjust them based on these starting points, influenced by the specified forces, ensuring that the adjusted coordinates remain close to their previous positions.

```javascript (NetworkTimeline.js)
  const graph = useRef(null); // Using useRef to persist the graph instance across renders
  const [currentDate, setCurrentDate] = useState(lastDate);

  const {nodes: nodesLast} = dataProcessing(entities, relationships, transaction_viewer, lastDate, 1)
  const simulation = getSimulation(width * 0.82, height - 160)
  simulation.nodes(nodesLast)  

  useEffect(() => {
    const {nodes, links} = dataProcessing(entities, relationships, transaction_viewer, currentDate, 1)

    nodes.forEach(d => {
      const node = nodesLast.find(n => n.Entity === d.Entity)
      d.x = node.x
      d.y = node.y
    })

    if (graph.current) {
      graph.current.update({ nodes, links });
    } else {
      graph.current = ForceGraph(
        { nodes, links },
        {
          //...configuration settings
        }
      );
    }

  }, [currentDate, relationships, entities, width, height]);
```

Encapsulate the simulation definition within a function so it can be reused with the same configuration in both the `NetworkTimeline` and `ForceGraph`, ensuring synchronized graph layouts. Attributes such as distance can still be specified separately to customize link distances as needed for a cleaner-looking graph layout.

```javascript (/charts/network/index.js)
export function getSimulation(width, height) {
  return d3.forceSimulation()
    .force(
      'link',
      d3
        .forceLink()
        .id((d) => d.id)
        .strength(0.8)
        .distance((d) => d.distance || (d.tier === 1 ? 200 : 20))
    )
    .force('x', d3.forceX((d) => d.x))
    .force('y', d3.forceY((d) => d.y))
    .force("center", d3.forceCenter(width/2, height/2))
    .force('charge', d3.forceManyBody().strength(-1500))
    .force(
      'collide',
      d3
        .forceCollide()
        .radius((d) => d.radius * 1.2)
        .iterations(3)
    )
    //.force('cluster', forceCluster().strength(0.15))
}
```

## Transition effect: The D3.js Join pattern

- *Enter selection* : This step deals with data that has no corresponding DOM elements (i.e., new data points). D3.js creates new DOM elements for the nodes and links. Here, nodes are rendered at inital coordinates (`x0` and `y0`). 

- *Update selection* : This step handles data that already has corresponding DOM elements. D3.js updates the existing elements to reflect the new data values, moving existing nodes to their new coordinates (`x` and `y`) whilst implementing style changes.

- *Exit selection* : This step handles the case where there are DOM elements that no longer have corresponding data points. D3.js removes these elements from the DOM.

```javascript (NetworkTimeline.js)
    nodeG.selectAll('.node')
      .data(.nodes, (d) => d.id)
      .join(
        (enter) => {
          hasNewNodes = enter.nodes().length === 0 ? false : true

          const newNode = enter
            .append('g')
            .attr('class', 'node')
            .attr('pointer-events', 'auto')
            .attr('cursor', 'pointer')
            .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`)
            .call(drag(simulation))
            .attr('opacity', 0)
            .on('dblclick.zoom', null)
            .call(enterNodeFunc)

          newNode
            .append('circle')
            .attr('r', (d) => d.radius)
            .attr('fill', (d) => d.color)
            .attr('stroke', (d) => nodeStyles.stroke || d.color)
            .attr('fill-opacity', nodeStyles.fillOpacity)
            .attr('stroke-opacity', nodeStyles.strokeOpacity)
            .attr('stroke-width', nodeStyles.strokeWidth)

          newNode.call(updateIconFunc)
            
          return newNode
        },
        (update) => update.call(updateNodeFunc),
        exit => exit.call(exitFunc)
      )
```

### What's happening in motion:

1. On page load, nodes fade into view over 0.5 seconds.
2. When the graph updates, newly added nodes fade in, while existing nodes transition to their new positions over 0.8 seconds, following a 0.5-second delay.
3. If any new nodes are added (hasNewNodes = true), all existing circles immediately turn gray. After a 0.5-second delay, any style changes are applied to the circles and icons, transitioning over 0.8 seconds. This creates a smooth effect where existing elements are dimmed when new ones are introduced, highlighting the change before returning to their original state.

<br/>

<video width="100%" controls>
  <source src={NETWORK_TIMELINE_HOVER} type="video/mp4">
  Your browser does not support the video tag.
</video>

<br/>

I also implemented a timeline control panel.

<video width="100%" controls>
  <source src={NETWORK_TIMELINE_PLAY} type="video/mp4">
  Your browser does not support the video tag.
</video>

> Gotcha: To prevent any mouse events from triggering while a transition is happening in D3.js, which may cause unwanted side effects, use a flag (`isTransitioning`) to indicate whether a transition is in progress. Check the flag at the beginning of the `mouseover` and `mouseleave` event handler to determine if the event should proceed.  The flag is set to true before a transition starts and reset to false using the .on('end', ...) method after the transition ends.

```javascript (NetworkTimeline.js)
  const t = svg.transition().delay(500).duration(800);
  const eT = svg.transition().duration(500)

  const enterNodeFunc = enter => {
    enter
      .transition(eT)
      .attr("opacity", 1)
  }

  const updateNodeFunc = update => {
    update
      .transition(t)
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)

    if(hasNewNodes) {
      update
      .select('circle')
      .attr('fill', '#d4d4d4')
      .attr('stroke', '#d4d4d4')
    } 

    update
      .select('circle')
      .transition(t)
      .attr('r', d => d.radius)
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => nodeStyles.stroke || d.color)
      .on('end', () => { isTransitioning = false; });

    update.call(updateIconFunc)
  }

  const exitFunc = exit => {
    return exit.remove() // remove from DOM
  }
```

With the D3.js Join pattern, it becomes easy to control what happens on enter, update and exit. The motion effect explained above nicely demonstrates this!

It was nice knowing that through the amalgamation of my past code and methods, I could sucessfully implement the feature I want. I can still vaguely remember myself perusing various d3.js code blocks years ago, making sure I understand the d3.js general update pattern and having to experiment with the d3-force module to achieve desired transition effects.

## Node and edge style

From the beginning, my goal has been to make the network generating function as reusable and flexible as possible for any project. Therefore, it is designed to support various customizations, bells and whistles, with the ability to easily toggle options on or off as needed.

### Customizations:

1. Icons within each node
2. Arrowheads and link widths that are dynamically sized
3. Node labels with text wrapping for long texts
4. Edge labels positioned in-line with the link at the midpoint

### Tips to create these:

1. Instead of hardcoding SVG icons inside the network function, assign an icon file path to each entity within the dataset. If there is no path specified, no icon will be rendered for that node.
2. Fallback style (eg. color, stroke-width) assignment to a default value if the attribute value is not part of the scale's domain.
3. Encapsulate as separate function for conciseness when applying the D3.js Join pattern.

<br/>

```javascript
function updateIconFunc(selection) {
  // Load SVG and append it to the node only if filepath is specified and exists
  selection.each(function(d) {
    if(d.svgIconFile) {
      // Load the SVG file
      d3.xml(d.svgIconFile).then((xml) => {
        const importedNode = document.importNode(xml.documentElement, true);
        // Append the SVG into the current group node
        d3.select(this).node().appendChild(importedNode);
        // Optionally, you can scale or position the imported SVG
        d3.select(importedNode)
          .attr('fill', d.color)
          .attr('width', d.radius)
          .attr('height', d.radius)
          .attr('x', (d.radius / 2) * -1)
          .attr('y', (d.radius / 2) * -1);
      });
    }
  })
}
```


Demonstration of 'Expand' and 'Reset' action
<video width="100%" controls>
  <source src={NETWORK_EXPAND_RESET} type="video/mp4">
  Your browser does not support the video tag.
</video>


## Other charts in dashboard

For this section below the network, I built a scatterplot and bubble chart with D3.js. These two charts were created with reusability, interactivity and dynamic data updates in mind, hence followed a similar structure as the network generating function.

Thesse charts were rendered inside React components, which then called from the `Dashboard` component.

# Challenges faced

Whilst a graph/network data structure seem all too familiar to me, it's not with the client, and he asked me to take the time over a video call to explain to him how not only to construct a dataset of entities and relationships from scratch, but also to create one with multiple levels of connections. There were repeated back-and-forth correspondences and video demos to confirm his understanding of the matter. 

The client mentioned having datasets for the prototype, but it turned out that the time series of relationships for the network and other charts' datasets didn't exist. Although creating mock data might seem quick, it still requires my time and effort. He provided only a list of events and an array of entities and relationships, but not the full time series dataset needed for the graph. I had to manually construct the dataset so that hovering over a specific timestamp would reveal the corresponding snapshot of the graph. Ulimately, there were also various adjustments needed to finalize the prototype for client approval. These were addressed throughout the third week. 

Instead of receiving a detailed Scope of Work document and Figma design, the client's vision for the prototype was conveyed during a face-to-face meeting. I realized later that I missed some of his verbal instructions, with amounted to a sizeable list of new to-dos. This includes interactively updating the table content next to the scatter plot when a datapoint is hovered, dim entry effect of ndoes, the 'Expand' and 'Reset' feature of the network viz.

Fortunately, adding these features wasn't too difficult with my network and chart rendering functions. However, together, these overlooked features significantly impacted my initial cost evaluation.


# Lessons learned

Writing clean code that not only accomplishes the task but can be easily referenced or reused even years later is incredibly satisfying.

By mid of Week 2, I realized that I had underestimated the number of tasks in this project. I still struggle to break down project tasks with precise detail, which is crucial for fixed-rate projects. In fact, I think it is practically impossible to list out all tasks as bullet points expanded into multiple layers of sub-points, with time and cost estimates for each. When I feel underpaid, I usually try to renegotiate a higher fee, especially if both the client and I agree that the work is good quality and on the right track. Sometimes, this approach will not work.

Instead of depending on the client's trust, it's crucial to accurately scope the project from the outset and include a sufficient buffer to ensure your fee surpasses your initial estimate, to ensure that you're covered for any unexpected challenges or additional work that may arise, preventing potential shortfalls in your compensation. Always ask the client to provide a detailed Scope of Work (SOW) alongside the contract, particularly if they emphasize that the app needs to be built according to their specific vision within a fixed fee. Take the time to review and edit it further until you are comfortable with it. In my own contract, I noticed that it only contained brief bullet points of few sentences. This is not a SOW. While this may seem like common sense, I want to emphasize the importance of this approach to both myself and others.

<br/>