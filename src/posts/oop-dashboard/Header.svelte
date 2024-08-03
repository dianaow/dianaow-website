<script>
  export let title = "Header Title";
  export let url = "#";
</script>

<style>
  .header {
    display: flex;
    align-items: center;
  }

  .arrow {
    margin-top: 4.6em;
    margin-left: 0.5em;
    transition: transform 0.2s ease-in-out;
  }

  .arrow:hover {
    transform: scale(1.5);
  }
</style>

<header class="header">
  <h2>{title}</h2>
  <a href={url} target="_blank" class="arrow">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-arrow-up-right"
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  </a>
</header>
