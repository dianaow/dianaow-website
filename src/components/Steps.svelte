<script>
  import { createEventDispatcher } from 'svelte';

  export let image;
  export let steps = [];
  const dispatch = createEventDispatcher();
  
  let currentHighlightId = 0;
  let highlightTimeouts = {};
  let preElement; // Reference to the code container's pre element

  // Function to check if a line is visible
  function isLineFullyVisible(lineNumber) {
    if (!preElement) return false;
    
    const lineElement = preElement.querySelector(`#line-${lineNumber}`);
    if (!lineElement) return false;

    const containerRect = preElement.getBoundingClientRect();
    const lineRect = lineElement.getBoundingClientRect();
    const buffer = 2; // Small buffer to account for partial pixel visibility

    // Check if the line is fully visible within the container
    return (
      lineRect.top >= containerRect.top - buffer &&
      lineRect.bottom <= containerRect.bottom + buffer &&
      lineRect.height > 0 // Ensure the line has actual height
    );
  }

  function handleMouseEnter(step, event) {
    const highlightId = ++currentHighlightId;
    
    const stepElement = event.currentTarget;
    const stepRect = stepElement.getBoundingClientRect();
    const containerRect = stepElement.parentElement.getBoundingClientRect();
    const relativePosition = stepRect.top - containerRect.top - 30;
    
    // Always scroll for step-item
    dispatch('scroll', { 
      line: step.lines[0], 
      stepPosition: relativePosition,
      highlightId: highlightId
    });
    
    // Change text color to match bullet
    const titleElement = stepElement.querySelector('.step-title');
    if (titleElement) {
      titleElement.style.color = step.color;
    }
    
    Object.keys(highlightTimeouts).forEach(id => {
      clearTimeout(highlightTimeouts[id]);
      delete highlightTimeouts[id];
    });
    
    highlightTimeouts[highlightId] = setTimeout(() => {
      if (highlightId === currentHighlightId) {
        dispatch('highlight', { 
          lines: step.lines,
          highlightId: highlightId
        });
      }
      delete highlightTimeouts[highlightId];
    }, 100);
  }

  function handleMouseLeave(event) {
    const highlightId = ++currentHighlightId;
    
    // Reset text color
    const stepElement = event.currentTarget;
    const titleElement = stepElement.querySelector('.step-title');
    if (titleElement) {
      titleElement.style.color = 'rgb(203, 213, 225)';
    }
    
    Object.keys(highlightTimeouts).forEach(id => {
      clearTimeout(highlightTimeouts[id]);
      delete highlightTimeouts[id];
    });
    
    highlightTimeouts[highlightId] = setTimeout(() => {
      if (highlightId === currentHighlightId) {
        dispatch('highlight', { 
          lines: [],
          highlightId: highlightId
        });
      }
      delete highlightTimeouts[highlightId];
    }, 50);
  }

  function handleDescriptionMouseEnter(step, descriptionIndex, event) {
    event.stopPropagation();
    
    const highlightId = ++currentHighlightId;
    const descriptionElement = event.currentTarget;
    
    // Change text color to white
    descriptionElement.style.color = 'white';
    
    Object.keys(highlightTimeouts).forEach(id => {
      clearTimeout(highlightTimeouts[id]);
      delete highlightTimeouts[id];
    });
    
    let linesToHighlight = step.lines;
    if (step.descriptionLines && step.descriptionLines[descriptionIndex]) {
      linesToHighlight = step.descriptionLines[descriptionIndex];
    }
    
    // Check if any of the lines are not visible
    // Check if any of the target lines are not fully visible
    const shouldScroll = linesToHighlight.some(lineNumber => !isLineFullyVisible(lineNumber));
    
    if (shouldScroll) {
      // Only scroll if lines are not visible
      const stepElement = descriptionElement.closest('.step-item');
      const stepRect = stepElement.getBoundingClientRect();
      const containerRect = stepElement.parentElement.getBoundingClientRect();
      const relativePosition = stepRect.top - containerRect.top - 30;
      
      dispatch('scroll', { 
        line: linesToHighlight[0], 
        stepPosition: relativePosition,
        highlightId: highlightId
      });
    }
    
    highlightTimeouts[highlightId] = setTimeout(() => {
      if (highlightId === currentHighlightId) {
        dispatch('highlight', { 
          lines: linesToHighlight,
          highlightId: highlightId
        });
      }
      delete highlightTimeouts[highlightId];
    }, 100);
  }

  function handleDescriptionMouseLeave(event) {
    event.stopPropagation();
    
    const highlightId = ++currentHighlightId;
    const descriptionElement = event.currentTarget;
    
    // Reset text color
    descriptionElement.style.color = 'rgb(148, 163, 184)';
    
    Object.keys(highlightTimeouts).forEach(id => {
      clearTimeout(highlightTimeouts[id]);
      delete highlightTimeouts[id];
    });
    
    highlightTimeouts[highlightId] = setTimeout(() => {
      if (highlightId === currentHighlightId) {
        dispatch('highlight', { 
          lines: [],
          highlightId: highlightId
        });
      }
      delete highlightTimeouts[highlightId];
    }, 50);
  }

  // Get reference to pre element from CodeBlock
  export function setPreElement(element) {
    console.log('[Steps] Received pre element:', element);
    preElement = element;
  }
</script>

<ul class="steps-container">
  {#each steps as step, index}
    <li 
      class="step-item"
      on:mouseenter={(e) => handleMouseEnter(step, e)} 
      on:mouseleave={handleMouseLeave}
    >
      <div class="step-header">
        <span 
          class="bullet" 
          style="background-color: {step.color};"
        >
          {index + 1}
        </span>
        <span class="step-title">{step.title}</span>
      </div>
      <div class="step-content">
        {#if Array.isArray(step.descriptions)}
          <ul class="descriptions-list">
            {#each step.descriptions as description, descriptionIndex}
              <li 
                class="description-item"
                on:mouseenter={(e) => handleDescriptionMouseEnter(step, descriptionIndex, e)}
                on:mouseleave={handleDescriptionMouseLeave}
              >{description}</li>
            {/each}
          </ul>
        {:else}
          <p class="single-description">{step.text || step.descriptions}</p>
        {/if}
      </div>
    </li>
  {/each}
  
  {#if image}
    <figure>
      <img src={image} width="60%" alt="Step">
      <figcaption>How the DOM looks like</figcaption>
    </figure>
  {/if}
</ul>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding-left: 0;
  }

  .step-item {
    margin: 1.5rem 0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .step-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .bullet {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    border-radius: 50%;
    color: white;
    font-weight: bold;
    font-size: 0.875rem;
  }

  .step-title {
    color: rgb(203, 213, 225);
    font-weight: 600;
    font-size: 1rem;
  }

  .step-content {
    padding-left: 32px;
  }

  .descriptions-list {
    list-style: disc;
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .description-item {
    color: rgb(148, 163, 184);
    margin: 0.35rem 0;
    font-size: 0.875rem;
    cursor: pointer;
    line-height: 1.6rem;
  }

  .single-description {
    color: rgb(148, 163, 184);
    margin: 0;
    font-size: 0.875rem;
  }

  figure {
    margin-top: 2rem;
  }

  figcaption {
    color: rgb(148, 163, 184);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
</style>