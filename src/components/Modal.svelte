<script>
  import { scale } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let project = {
    title: '',
    description: '',
    technology: [],
    links: [],
    image: ''
  };
  
  function closeModal() {
    dispatch('close');
  }
  
  // Close modal when clicking outside
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
  
  // Close on escape key
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div 
  class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  on:click={handleBackdropClick}
>
  <div 
    class="bg-slate-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl"
    transition:scale={{duration: 200, start: 0.95}}
  >
    <div class="flex h-full">
      <!-- Project Details -->
      <div class="w-1/3 p-6 overflow-y-auto">
        <h2 class="text-2xl font-bold text-white mb-4">{project.title}</h2>
        
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-2">Description</h3>
          <p class="text-gray-300">{project.description}</p>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-2">Technology</h3>
          <div class="flex flex-wrap gap-2">
            {#each project.technology as tech}
              <span class="px-3 py-1 bg-slate-800 rounded-full text-sm text-gray-300">
                {tech}
              </span>
            {/each}
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-2">Links</h3>
          <div class="flex flex-col gap-2">
            {#each project.links as link}
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                {link.title}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            {/each}
          </div>
        </div>
        
        <button
          class="absolute top-4 right-4 text-gray-400 hover:text-white"
          on:click={closeModal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Project Image -->
      <div class="w-2/3 bg-slate-800 flex items-center justify-center">
        <img 
          src={project.image} 
          alt={project.title}
          class="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  </div>
</div>