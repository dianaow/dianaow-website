<script>
  import { createEventDispatcher } from 'svelte';

  export let image;
  export let steps = [];
  const dispatch = createEventDispatcher();

  function handleMouseEnter(step) {
    dispatch('highlight', { lines: step.lines, color: step.color });
  }

  function handleMouseLeave() {
    dispatch('highlight', { lines: []});
  }
</script>

<ul>
  {#each steps as step, index}
    <li on:mouseover={() => handleMouseEnter(step)} on:mouseout={() => handleMouseLeave()}>
      <span class="bullet" style="background-color: {step.color};">{index + 1}</span><span class="bullet-label">{step.text}</span>
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
    padding-top: 30px;
  }
  li {
    margin: 1rem 0;
    cursor: pointer;
    display: flex;
  }
  .bullet {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border-radius: 50%;
    color: white;
    margin-right: 8px;
    font-weight: bold;
  }
  .bullet-label {
    color: rgb(203, 213, 225);
    display: inline-block;
  }
</style>
