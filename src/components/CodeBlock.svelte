<script>
  import { onMount, afterUpdate } from 'svelte';
  import { getHighlighter } from 'shiki'
  
  export let height = '720px';
  export let lang = 'javascript'
  export let steps = [];
  export let code = "";
  export let blockName = "";
  export let highlightedLines = {};
  export let stepsComponent; // Reference to Steps component

  let defaultCode = "";
  let codeContainer;
  let preElement;
  let isInitialized = false;
  
  let isScrolling = false;
  let scrollingPromise = null;
  let lastHighlightId = 0;
  let pendingHighlightRequest = null;

  function getColorForLine(lineNumber) {
    for (const step of steps) {
      if (step.lines.includes(lineNumber)) {
        return step.color;
      }
    }
    return null;
  }

  function applyHighlighting(lines, highlightId) {
    if (!preElement) return;
    
    console.log(`[CodeBlock] Applying highlight ID: ${highlightId || 'unknown'}, lines:`, lines);
    
    const allLines = preElement.querySelectorAll('[id^="line-"]');
    allLines.forEach(line => {
      line.style.backgroundColor = '';
      line.style.paddingLeft = '8px';
    });
    
    if (lines && lines.length > 0) {
      lines.forEach(lineNumber => {
        const lineElement = preElement.querySelector(`#line-${lineNumber}`);
        if (lineElement) {
          lineElement.style.backgroundColor = '#3a3659';
          lineElement.style.paddingLeft = '4px';
        }
      });
    }
  }

  export function scrollToLine(lineNumber, stepPosition, highlightId) {
    console.log('[CodeBlock] Scroll requested:', { lineNumber, stepPosition, highlightId });
    console.log('[CodeBlock] State:', { 
      initialized: isInitialized,
      hasContainer: !!codeContainer, 
      hasPreElement: !!preElement 
    });

    if (!isInitialized) {
      console.warn('[CodeBlock] Not yet initialized, queueing scroll');
      return new Promise((resolve) => {
        const checkInit = setInterval(() => {
          if (isInitialized && codeContainer && preElement) {
            clearInterval(checkInit);
            scrollToLine(lineNumber, stepPosition, highlightId).then(resolve);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInit);
          console.error('[CodeBlock] Initialization timeout');
          resolve();
        }, 5000);
      });
    }

    if (!codeContainer || !preElement) {
      console.warn('[CodeBlock] Container or pre element not found');
      return Promise.reject('Container or pre element not found');
    }

    const lineElement = codeContainer.querySelector(`#line-${lineNumber}`);
    if (!lineElement) {
      console.warn(`[CodeBlock] No line element found for line ${lineNumber}`);
      return Promise.reject(`No line element found for line ${lineNumber}`);
    }

    console.log(`[CodeBlock] Starting scroll to line ${lineNumber}, highlight ID: ${highlightId || 'unknown'}`);
    
    if (scrollingPromise) {
      console.log('[CodeBlock] Cancelling previous scroll operation');
      isScrolling = false;
    }
    
    isScrolling = true;
    lastHighlightId = highlightId || 0;
    
    scrollingPromise = new Promise((resolve) => {
      // Get the current viewport height of the pre element
      const viewportHeight = preElement.clientHeight;
      
      // Get the line's position relative to the pre element
      const lineHeight = lineElement.offsetHeight;
      const lineTop = lineElement.offsetTop;
      
      // Calculate the desired position of the step in the viewport
      const desiredStepOffset = stepPosition;
      
      // Calculate where we want the line to appear in the viewport
      const targetScrollTop = lineTop - desiredStepOffset;
      
      // Calculate maximum scroll position
      const maxScroll = preElement.scrollHeight - viewportHeight;
      
      // If target scroll would place line near bottom of long document,
      // adjust to keep within bounds while maintaining visibility
      let scrollValue;
      if (targetScrollTop > maxScroll) {
        // If we can't achieve the exact desired position,
        // ensure the line is at least visible in the viewport
        scrollValue = Math.max(
          Math.min(
            lineTop - (viewportHeight / 3), // Try to position line in top third
            maxScroll
          ),
          0
        );
      } else {
        scrollValue = Math.max(targetScrollTop, 0);
      }
      
      console.log(`[CodeBlock] Scrolling to position ${scrollValue} (max: ${maxScroll})`);
      
      // Only scroll if the value has changed
      if (Math.abs(preElement.scrollTop - scrollValue) > 1) {
        const scrollEndHandler = () => {
          preElement.removeEventListener('scrollend', scrollEndHandler);
          console.log('[CodeBlock] Scroll animation completed');
          isScrolling = false;
          
          if (pendingHighlightRequest) {
            const { lines, highlightId } = pendingHighlightRequest;
            console.log(`[CodeBlock] Processing pending highlight request ID: ${highlightId}`);
            applyHighlighting(lines, highlightId);
            pendingHighlightRequest = null;
          }
          
          resolve();
        };
        
        if ('onscrollend' in window) {
          preElement.addEventListener('scrollend', scrollEndHandler, { once: true });
        } else {
          setTimeout(scrollEndHandler, 500);
        }
        
        preElement.scrollTo({
          top: scrollValue,
          behavior: 'smooth'
        });
      } else {
        console.log('[CodeBlock] No scroll needed, already at desired position');
        isScrolling = false;
        resolve();
      }
    });
    
    return scrollingPromise;
  }

  afterUpdate(() => {
    if (highlightedLines) {
      const highlightId = highlightedLines.highlightId || 0;
      
      if (isScrolling) {
        console.log(`[CodeBlock] Scrolling in progress, queuing highlight ID: ${highlightId}`);
        pendingHighlightRequest = {
          lines: highlightedLines.lines,
          highlightId: highlightId
        };
      } else {
        applyHighlighting(highlightedLines.lines, highlightId);
      }
    }
  });

  async function initializeCodeBlock() {
    console.log('[CodeBlock] Starting initialization');
    try {
      const shikiHighlighter = await getHighlighter({
        themes: ['rose-pine-moon'],
        langs: ['javascript', 'typescript', 'svelte', 'python']
      });
      
      defaultCode = await shikiHighlighter.codeToHtml(code, { lang, theme: 'rose-pine-moon' });
      defaultCode = `<div>${blockName}</div>${defaultCode}`;
      
      const codeLines = defaultCode.split('\n');
      
      const processedLines = [...codeLines].map((line, index) => {
        const lineColor = getColorForLine(index);
        const borderStyle = lineColor ? `border-left: 4px solid ${lineColor};` : 'border-left: 4px solid transparent;';
        
        if (typeof line === 'string' && line.includes('<span class="line">')) {
          return line.replace('<span class="line">', `<span id="line-${index}" class="line" style="padding-left: 8px; ${borderStyle}">`);
        }
        return line;
      });
      
      const processedCode = processedLines.join('\n');
      
      if (codeContainer) {
        codeContainer.innerHTML = processedCode;
        preElement = codeContainer.querySelector('pre');
        console.log('[CodeBlock] Pre element set:', preElement);
        
        // Share pre element reference with Steps component
        if (stepsComponent) {
          console.log('[CodeBlock] Steps component ready, sharing pre element');
          stepsComponent.setPreElement(preElement);
        } else {
          console.warn('[CodeBlock] Steps component not ready, will retry');
          // Retry a few times
          let retries = 0;
          const maxRetries = 5;
          const retryInterval = setInterval(() => {
            if (stepsComponent) {
              console.log('[CodeBlock] Steps component now ready, sharing pre element');
              stepsComponent.setPreElement(preElement);
              clearInterval(retryInterval);
            } else if (++retries >= maxRetries) {
              console.error('[CodeBlock] Failed to share pre element after max retries');
              clearInterval(retryInterval);
            }
          }, 100);
        }
        
        isInitialized = true;
        console.log(`[CodeBlock] Initialized with ${codeLines.length} lines`);
      } else {
        console.error('[CodeBlock] Code container not found during initialization');
      }
    } catch (error) {
      console.error('[CodeBlock] Initialization error:', error);
    }
  }

  onMount(() => {
    initializeCodeBlock();
  });
</script>

<div class="code-block" bind:this={codeContainer} style="--code-height: {height};">
  <!-- Content will be injected here by onMount -->
</div>

<style>
  .code-block {
    min-width: 50%;
    position: relative;
  }
  
  .code-block-title {
    margin-top: 0em !important;
  }
  
  .code-block :global(pre) {
    height: var(--code-height) !important;
    max-height: var(--code-height) !important;
    margin: 0;
    padding: 1rem;
  }
</style>