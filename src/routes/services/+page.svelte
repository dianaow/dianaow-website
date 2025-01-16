<script>
  import { onMount, onDestroy } from 'svelte';
  import { Application, Assets, Sprite, Container } from 'pixi.js';
  
  const GRID_COLUMNS = 4;
  const PADDING = 16;
  const ASPECT_RATIO = 16 / 9;
  
  // Array of image paths to display in the grid
  const images = [
    "/src/lib/images_small/kpop_jpop_network.png",
    "/src/lib/images_small/covid_network.png",
    "/src/lib/images_small/vizforsocialgood-network.png",
    "/src/lib/images/financial_network.png",
    "/src/lib/images_small/ifs-network.png"
  ];

  let app;
  let pixiContainer;

  const initPixi = async () => {
    if (!pixiContainer) return;

    // Initialize PixiJS Application with v8 options
    const app = new Application();
    
    // Intialize the application.
    await app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#020617',
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Add canvas to the DOM
    pixiContainer.appendChild(app.canvas);

    // Create a container for all sprites
    const container = new Container();
    app.stage.addChild(container);
    
    // Calculate grid dimensions
    const containerWidth = container.width;
    const imageWidth = (containerWidth - (PADDING * (GRID_COLUMNS - 1))) / GRID_COLUMNS;
    const imageHeight = imageWidth / ASPECT_RATIO;

    // Load all textures first using Assets
    try {
      // Add all images to the asset manifest
      const manifest = images.map((path, index) => ({
        alias: `image${index}`,
        src: path
      }));

      // Load all assets
      await Assets.init({ manifest });
      await Assets.loadBundle(manifest.map(m => m.alias));

      console.log(images)
      // Create sprites for all images
      images.forEach(async (imagePath, index) => {
        const texture = await Assets.get(`image${index}`);
        const sprite = Sprite.from(texture);
        
        // Position in grid
        const column = index % GRID_COLUMNS;
        const row = Math.floor(index / GRID_COLUMNS);
        
        sprite.x = column * (imageWidth + PADDING);
        sprite.y = row * (imageHeight + PADDING);
        
        // Set dimensions
        sprite.width = imageWidth;
        sprite.height = imageHeight;
        
        container.addChild(sprite);
      });
    } catch (error) {
      console.error('Error loading images:', error);
    }

    return app
  };

  // Handle window resizing
  function handleResize() {
    if (app) {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    }
  }

  onMount(async () => {
    app = await initPixi();
    if(app) {
      window.addEventListener('resize', handleResize);
    }
  });

  onDestroy(() => {
    if (app) {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
  });
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
  <!-- Services Section -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4 text-center">Network Visualization Solutions</h1>
    <p class="text-xl text-gray-600 mb-8 text-center">
      Transform your data into powerful, interactive network visualizations
    </p>
    
    <!-- Service Tiers -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <!-- Basic Tier -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Basic</h2>
        <p class="text-3xl font-bold text-blue-600 mb-4">$499</p>
        <ul class="space-y-2 mb-6">
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Up to 100 nodes
          </li>
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Force-directed layout
          </li>
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Basic interactivity
          </li>
        </ul>
        <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>

      <!-- Professional Tier -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Professional</h2>
        <p class="text-3xl font-bold text-blue-600 mb-4">$999</p>
        <ul class="space-y-2 mb-6">
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Up to 500 nodes
          </li>
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Multiple layouts
          </li>
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Advanced filtering
          </li>
        </ul>
        <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>

      <!-- Enterprise Tier -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Enterprise</h2>
        <p class="text-3xl font-bold text-blue-600 mb-4">Custom</p>
        <ul class="space-y-2 mb-6">
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Unlimited nodes
          </li>
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Custom algorithms
          </li>
          <li class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Priority support
          </li>
        </ul>
        <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Contact Us
        </button>
      </div>
    </div>
  </div>

  <!-- Image Grid -->
  <div class="mt-12">
    <h2 class="text-2xl font-bold mb-6">Example Visualizations</h2>
    <div bind:this={pixiContainer} class="w-full" style="height: 800px;"></div>
  </div>
</div>

<style>
  :global(canvas) {
    display: block;
  }
</style>