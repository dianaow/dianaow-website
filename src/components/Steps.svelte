<script>
  import { createEventDispatcher } from 'svelte';

  export let image;
  export let steps = [];
  const dispatch = createEventDispatcher();

  function handleMouseEnter(step, event) {
    const stepElement = event.currentTarget;
    const stepRect = stepElement.getBoundingClientRect();
    const containerRect = stepElement.parentElement.getBoundingClientRect();

    // Calculate relative position of the step from the top of its container
    const relativePosition = stepRect.top - containerRect.top - 60;
    
    dispatch('highlight', { lines: step.lines, color: step.color });
    dispatch('scroll', { 
      line: step.lines[0],
      stepPosition: relativePosition // Pass the step's position
    });
  }

  function handleMouseLeave() {
    dispatch('highlight', { lines: []});
  }
</script>

<ul class="steps-container">
  {#each steps as step, index}
    <li 
      class="step-item"
      on:mouseenter={(e) => handleMouseEnter(step, e)} 
      on:mouseleave={() => handleMouseLeave()}
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
            {#each step.descriptions as description}
              <li class="description-item">{description}</li>
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
