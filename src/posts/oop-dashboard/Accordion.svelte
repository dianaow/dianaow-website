<script>
  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<style>
  .accordion {
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 10px 0;
  }
  .accordion-header {
    display: flex;
    align-items: center; /* Align chevron and text */
    background-color: transparent;
    cursor: pointer;
    padding: 10px;
    font-weight: bold;
  }
  .accordion-content {
    padding: 10px;
    border-top: 1px solid #ccc;
    display: none;
  }
  .accordion-content.open {
    display: block;
  }
  .chevron {
    transition: transform 0.3s;
    transform: rotate(0deg); /* Point to the right by default */
    margin-right: 10px; /* Add spacing between chevron and text */
  }
  .chevron.open {
    transform: rotate(90deg); /* Point down when open */
  }
</style>

<div class="accordion">
  <div class="accordion-header" on:click={toggle}>
    <svg
      class:open={isOpen}
      class="chevron"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 5l8 7-8 7"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span>Show code snippet</span>
  </div>
  <div class:open={isOpen} class="accordion-content">
    <slot></slot>
  </div>
</div>
