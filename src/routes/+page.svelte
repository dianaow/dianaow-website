<script>
  import { onMount, onDestroy } from 'svelte';
  import { Application, Assets, Sprite, Container, SCALE_MODES, RenderTexture } from 'pixi.js';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import data from '$lib/data/metadata.json';
  import { RectArrangement } from '$lib/helper/rectpacking.js';

  let hoveredTitle = null;
  let pixiContainer;
  let app;
  let sprites = [];
  let selectedProject = null;
  let isDragging = false;
  let isClustered = false;
  let dragStartTime = 0;
  let isFullscreenReady = false;
  const DRAG_THRESHOLD = 200; // milliseconds

  function calculateGridPositions(rectangles, width, height) {
    const sa = new RectArrangement([width * 0.65, height]);

    let n = 0;
    let coords = []
    for (const [area, ratio] of rectangles) {
      sa.addRect(area, ratio);
      n++;
    }
    
    for (let s of sa.rects) {
      let [x0, y0] = s[0].p
      coords.push({ x: x0 + 50, y: y0 - height/2 })
    }
    return coords;
  }

  // Add this function to properly load assets
  async function loadAsset(path) {
      try {
          // First add the asset
          await Assets.add({ alias: 'uniqueId_' + path, src: path });
          // Then load it
          return await Assets.load('uniqueId_' + path);
      } catch (error) {
          console.error('Error loading asset:', path, error);
          return null;
      }
  }

  // Add this function to handle clustering toggle
  const toggleClusterLayout = () => {
    isClustered = !isClustered;
    
    const rects = sprites.map(sprite => [sprite.width * sprite.height, sprite.width/sprite.height])

    const positions = isClustered ? 
      calculateGridPositions(rects, app.screen.width, app.screen.height) :
      sprites.map(sprite => {
        const pos = getRandomPosition(sprite, sprites, app.screen.width, app.screen.height);
        return { x: pos.x, y: pos.y };
      });

    // Animate sprites to new positions
    sprites.forEach((sprite, index) => {
      const targetPos = positions[index];
      
      // Store original rotation for scattered layout
      if (!isClustered) {
        sprite.userData.targetRotation = (Math.random() * 30 - 15) * Math.PI / 180;
      }
      
      const animate = () => {
        const dx = (targetPos.x - sprite.x) * 0.1;
        const dy = (targetPos.y - sprite.y) * 0.1;
        const targetRotation = isClustered ? 0 : sprite.userData.targetRotation;
        const dr = (targetRotation - sprite.rotation) * 0.1;

        sprite.x += dx;
        sprite.y += dy;
        sprite.rotation += dr;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(dr) > 0.001) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  };

  // Helper function to check if two sprites overlap
  const checkOverlap = (pos1, size1, pos2, size2, threshold = 0.8) => {
    const bounds1 = {
      left: pos1.x - size1.width / 2,
      right: pos1.x + size1.width / 2,
      top: pos1.y - size1.height / 2,
      bottom: pos1.y + size1.height / 2
    };

    const bounds2 = {
      left: pos2.x - size2.width / 2,
      right: pos2.x + size2.width / 2,
      top: pos2.y - size2.height / 2,
      bottom: pos2.y + size2.height / 2
    };

    // Calculate overlap area
    const xOverlap = Math.max(0, Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left));
    const yOverlap = Math.max(0, Math.min(bounds1.bottom, bounds2.bottom) - Math.max(bounds1.top, bounds2.top));
    const overlapArea = xOverlap * yOverlap;
    
    // Calculate minimum area
    const area1 = size1.width * size1.height;
    const area2 = size2.width * size2.height;
    const minArea = Math.min(area1, area2);
    
    return (overlapArea / minArea) > threshold;
  };
  
  // Helper function to get random position within bounds with overlap checking
  const getRandomPosition = (newSprite, existingSprites, canvasWidth, canvasHeight, maxAttempts = 50) => {
    const margin = 0.1; // 10% margin for edge overlap
    const spriteWidth = newSprite.width;
    const spriteHeight = newSprite.height;
    
    // Set z-index based on priority
    if (newSprite.userData?.priority) {
      newSprite.zIndex = 1000; // High z-index for priority items
    } else {
      newSprite.zIndex = 1; // Default z-index for non-priority items
    }
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pos = {
        x: (canvasWidth*0.32) + Math.random() * ((canvasWidth*0.63) - spriteWidth * (1 - margin * 2)) + spriteWidth * margin,
        y: Math.random() * (canvasHeight - spriteHeight * (1 - margin * 2)) + spriteHeight * margin
      };

      // For priority items, we only check overlap with other priority items
      // For non-priority items, we check overlap with all items
      let hasOverlap = false;
      for (const sprite of existingSprites) {
        if (newSprite.userData?.priority) {
          // Priority items only check overlap with other priority items
          if (sprite.userData?.priority && checkOverlap(
            pos, 
            { width: spriteWidth, height: spriteHeight },
            { x: sprite.x, y: sprite.y },
            { width: sprite.width, height: sprite.height }
          )) {
            hasOverlap = true;
            break;
          }
        } else {
          // Non-priority items check overlap with all items
          if (checkOverlap(
            pos, 
            { width: spriteWidth, height: spriteHeight },
            { x: sprite.x, y: sprite.y },
            { width: sprite.width, height: sprite.height }
          )) {
            hasOverlap = true;
            break;
          }
        }
      }

      if (!hasOverlap) return pos;
    }

    // Fallback position if no non-overlapping position is found
    return {
      x: Math.random() * (canvasWidth - spriteWidth * (1 - margin * 2)) + spriteWidth * margin,
      y: Math.random() * (canvasHeight - spriteHeight * (1 - margin * 2)) + spriteHeight * margin
    };
  };

  // Make sprite draggable
  const makeSpriteDraggable = (app, sprite) => {
    sprite.eventMode = 'static';
    sprite.cursor = 'grab';
    
    let dragOffset = { x: 0, y: 0 };

    sprite
      .on('pointerdown', (event) => {
        isDragging = false;
        dragStartTime = Date.now();
        sprite.cursor = 'grabbing';
        sprite.alpha = 0.8;
        sprite.zIndex = Math.max(...sprites.map(s => s.zIndex)) + 1;

        const globalPosition = event.global;
        dragOffset.x = sprite.x - globalPosition.x;
        dragOffset.y = sprite.y - globalPosition.y;

        sprite.addEventListener('globalpointermove', onDragMove);
      });

    function onDragMove(event) {
      isDragging = true;
      const globalPosition = event.global;
      sprite.x = globalPosition.x + dragOffset.x;
      sprite.y = globalPosition.y + dragOffset.y;
    }

    sprite.on('pointerup', (event) => {
        endDrag();
        // Only handle click events when not clustered
        if (!isClustered && !isDragging && (Date.now() - dragStartTime) < DRAG_THRESHOLD) {
          const projectData = data.find(item => item.title === sprite.userData.title);
          if (projectData) {
            handleProjectSelect(app, projectData, sprite);
          }
        }
      })
      .on('pointerupoutside', endDrag);

    function endDrag() {
      sprite.cursor = 'grab';
      sprite.alpha = 1;
      sprite.removeEventListener('globalpointermove', onDragMove);
    }
  };

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
    
    // Load all textures
    try {
      await Promise.all(data.reverse().map(async (item, index) => {
        // Load texture
        const texture = await loadAsset(item.image);
        if(!texture) return

        // Create sprite with the scaled texture
        const sprite = new Sprite(texture);

        // Set sprite properties
        //sprite.anchor.set(0.5);
        
        // Set random scale 
        const scale = (app.screen.width < 1600 ? 0.09 : 0.12) + Math.random() * 0.03; 
        sprite.scale.set(scale);
        
        // Get position with minimal overlap
        const pos = getRandomPosition(sprite, sprites, app.screen.width, app.screen.height);
        sprite.x = pos.x;
        sprite.y = pos.y;

        // Random rotation (-15 to 15 degrees)
        sprite.rotation = (Math.random() * 30 - 15) * Math.PI / 180;
        sprite.alpha = 1;
        
        // Store reference to title for hover effect
        sprite.userData = { title: item.title };
        
        makeSpriteDraggable(app, sprite);

        // Add to our sprites array and to the container
        sprites.push(sprite);
        container.addChild(sprite);

      }));
    } catch (error) {
      console.error('Error loading textures:', error);
    }

    // Animation ticker
    app.ticker.add(() => {
      sprites.forEach(sprite => {
        if (!sprite.dragging) {
          const targetAlpha = (hoveredTitle === null || hoveredTitle === sprite.userData.title) ? 1 : 0;
          sprite.alpha += (targetAlpha - sprite.alpha) * 0.1;
        }
      });
    });

    return app
  };

  // Actions to take when a sprite is clicked
  function handleProjectSelect(app, project, sprite) {
    selectedProject = project;
    
    // Hide all other sprites
    sprites.forEach(s => {
      if (s !== sprite) {
          s.visible = false;
      }
      s.eventMode = 'none';
    });

    // Store original properties for reverting later
    sprite.userData = {
        ...sprite.userData,
        originalPosition: {
            x: sprite.x,
            y: sprite.y,
            scale: sprite.scale.x,
            rotation: sprite.rotation
        }
    };

    // Calculate target position and scale
    const targetX = app.screen.width/4;
    const targetY = 0;
    const scale = ((app.screen.width * 0.75) / sprite.width) * sprite.scale.x;
    const targetRotation = 0;

    const animate = () => {
        const dx = (targetX - sprite.x) * 0.1;
        const dy = (targetY - sprite.y) * 0.1;
        const dScale = (scale - sprite.scale.x) * 0.1;
        const dRotation = (targetRotation - sprite.rotation) * 0.1;

        sprite.x += dx;
        sprite.y += dy;
        // In v8, scale is still set the same way
        sprite.scale.set(sprite.scale.x + dScale);
        sprite.rotation += dRotation;
        
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(dScale) > 0.001) {
            // Use the new v8 Ticker.shared.add pattern if not using requestAnimationFrame
            requestAnimationFrame(animate);
        } else {
            isFullscreenReady = true;
        }
    };

    animate();
  }

  function exitFullscreen() {
    isFullscreenReady = false;
    
    // Find the original sprite
    const sprite = sprites.find(s => s.userData.title === selectedProject.title);
    
    if (sprite?.userData?.originalPosition) {
        const { x: targetX, y: targetY, scale: targetScale, rotation: targetRotation } 
            = sprite.userData.originalPosition;

        const animate = () => {
            const dx = (targetX - sprite.x) * 0.1;
            const dy = (targetY - sprite.y) * 0.1;
            const dScale = (targetScale - sprite.scale.x) * 0.1;
            const dRotation = (targetRotation - sprite.rotation) * 0.1;

            sprite.x += dx;
            sprite.y += dy;
            sprite.scale.set(sprite.scale.x + dScale);
            sprite.rotation += dRotation;

            if (Math.abs(dx) > 0.1 || 
                Math.abs(dy) > 0.1 || 
                Math.abs(dScale) > 0.001 ||
                Math.abs(dRotation) > 0.001) {
                requestAnimationFrame(animate);
            } else {
                // Clean up stored original position
                delete sprite.userData.originalPosition;
            }
        };

        // Show all sprites again
        sprites.forEach(s => {
            s.visible = true;
            s.eventMode = 'static'; // Reset to v8's default interactive mode
        });

        animate();
    }
    
    selectedProject = null;
  }

  function handleKeydown(event) {
    // Only handle escape if PixiJS is initialized and we have a selected project
    if (event.key === 'Escape' && isPixiInitialized && selectedProject) {
        exitFullscreen();
    }
  }
  
  // Handle window resizing
  function handleResize() {
    if (app) {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      
      if (isClustered) {
        const positions = calculateGridPositions(sprites, app.screen.width, app.screen.height);
        sprites.forEach((sprite, index) => {
          sprite.x = positions[index].x;
          sprite.y = positions[index].y;
        });
      } else {
        sprites.forEach((sprite, index) => {
          const pos = getRandomPosition(sprite, sprites.slice(0, index), app.screen.width, app.screen.height);
          sprite.x = pos.x;
          sprite.y = pos.y;
        });
      }
    }
  }

  // Table row hover handler
  function handleRowHover(title) {
    hoveredTitle = title;
    //console.log('Hovering:', title);
  }

  function handleRowClick(title) {
    hoveredTitle = title;
    const project = data.find(item => item.title === title);
    const sprite = sprites.find(s => s.userData.title === title);
    handleProjectSelect(app, project, sprite)
  }

  onMount(async () => {
    app = await initPixi();
    if(app) {
      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (app) {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeydown);
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
  });
</script>

<div class="flex h-screen w-full">
  <div class="absolute top-20 left-0 w-full h-full" bind:this={pixiContainer}>
    {#if !isFullscreenReady}
      <button 
        class="absolute top-0 right-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
        on:click={toggleClusterLayout}
      >
        {isClustered ? 'Scatter' : 'Cluster'}
      </button>
    {/if}
  </div>
  {#if !isFullscreenReady}
    <div class="absolute top-20 left-0 w-1/3 p-8 h-screen">
      <p class="pb-5">Web Developer with interested in data visualizations. I build data-rich web applications, interactive visual interfaces and data dashboards.</p>
      <ul class="list-disc pb-5">
        <li class='text-xs p-0 m-0'>D3.js</li>
        <li class='text-xs p-0 m-0'>Pixi.js</li>
        <li class='text-xs p-0 m-0'>Svelte / Sveltekit</li>
        <li class='text-xs p-0 m-0'>React / Next.js</li>
        <li class='text-xs p-0 m-0'>Plotly Dash</li>
      </ul>

      <div class="max-h-[65%] overflow-y-auto">
        <table class="w-full border-collapse">
          <thead class="sticky top-0 bg-slate-rev950">
            <tr class="border-b border-gray-200">
              <th class="text-left text-white text-sm p-2">Title</th>
              <th class="text-left text-white text-sm p-2">Category</th>
              <th class="text-left text-white text-sm p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {#each data as item}
              <tr 
                class="border-b border-gray-200 hover:bg-slate-900 cursor-pointer"
                on:mouseenter={() => handleRowHover(item.title)}
                on:mouseleave={() => handleRowHover(null)}
                on:click={() => handleRowClick(item.title)}
              >
              <td class="text-white text-sm p-2">{item.title}</td>
              <td class="text-white text-sm p-2">{item.category}</td>
              <td class="text-white text-sm p-2">{item.date}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

{#if selectedProject}
  <!-- Project details -->
  <div 
    class="absolute top-0 left-0 z-10 w-1/4 h-full p-12 bg-slate-950 text-white pointer-events-auto"
    transition:fly={{ x: -50, duration: 800, delay: 300, easing: cubicOut }}
  >
    <button
        class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        on:click={exitFullscreen}
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
    <h1 class="text-4xl font-bold mb-6">{selectedProject.title}</h1>
    
    <div class="space-y-8">
      <div>
        <p class="text-sm text-white/90">{selectedProject.description}</p>
      </div>

      <div>
        <h2 class="text-base font-semibold mt-3 mb-1">Category</h2>
        <p class="text-base text-white/90 mt-1">{selectedProject.category}</p>
      </div>

      <div>
        <h2 class="text-base font-semibold mt-3 mb-1">Date</h2>
        <p class="text-base text-white/90 mt-1">{selectedProject.date}</p>
      </div>

      <div>
        <h2 class="text-base font-semibold mt-3 mb-1">technologies</h2>
        <p class="text-base text-white/90 mt-1">{selectedProject.technologies}</p>
      </div>

      <div>
        <h2 class="text-base font-semibold mt-3 mb-1">website</h2>
        <p class="text-base text-white/90 mt-1"><a href={selectedProject.url} class="font-medium text-blue-600 dark:text-blue-500 hover:underline">{selectedProject.title}</a></p>
      </div>

    </div>
  </div>
{/if}

<style>
  :global(canvas) {
    display: block;
    overflow: hidden;
  }
</style>