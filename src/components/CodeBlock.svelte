<script>
  import { onMount, afterUpdate } from 'svelte';
  import { getHighlighter } from 'shiki'
  
  export let height = '720px';
  export let lang = 'javascript'
  export let steps = [];
  export let code = "";
  export let blockName = "";
  export let highlightedLines = {};

  let defaultCode = "";
  let codeContainer; // Bind to the outer container
  let isScrolling = false;
  let preElement;

  function getColorForLine(lineNumber) {
    for (const step of steps) {
      if (step.lines.includes(lineNumber)) {
        return step.color;
      }
    }
    return null;
  }

  // Apply highlighting directly to DOM elements instead of re-rendering
  function applyHighlighting(lines) {
    if (!preElement) return;
    
    // First, remove all current highlights
    const allLines = preElement.querySelectorAll('[id^="line-"]');
    allLines.forEach(line => {
      line.style.backgroundColor = '';
      line.style.paddingLeft = '8px';
    });
    
    // Then apply new highlights if there are any lines to highlight
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

  export function scrollToLine(lineNumber, stepPosition) {
    if (!codeContainer) {
      console.log('No code container found');
      return;
    }

    // Get the pre element which is the actual scrollable container
    const preElement = codeContainer.querySelector('pre');
    if (!preElement) {
      console.log('No pre element found');
      return;
    }

    const lineElement = codeContainer.querySelector(`#line-${lineNumber}`);
    if (!lineElement) {
      console.log('No line element found for line', lineNumber);
      return;
    }

    isScrolling = true;
    const lineTop = parseInt(lineElement.offsetTop, 10);
    const offset = stepPosition;
    const scrollValue = Math.max(0, lineTop - offset);

    preElement.scrollTo({
      top: scrollValue,
      behavior: 'smooth'
    });
  }

  // Watch for changes in highlightedLines
  afterUpdate(() => {
    if (!isScrolling && highlightedLines) {
      applyHighlighting(highlightedLines.lines);
    }
  });

  onMount(async () => {
    const shikiHighlighter = await getHighlighter({
      themes: ['rose-pine-moon'],
      langs: ['javascript', 'typescript', 'svelte', 'python']
    });
    
    // Generate initial syntax highlighted code
    defaultCode = await shikiHighlighter.codeToHtml(code, { lang, theme: 'rose-pine-moon' });
    defaultCode = `<div>${blockName}</div>${defaultCode}`;
    
    // Apply line IDs to each line for targeting
    const codeLines = defaultCode.split('\n');
    const processedLines = codeLines.map((line, index) => {
      return line.replace('<span class="line">', `<span id="line-${index}" class="line" style="padding-left: 8px; border-left: 4px solid ${getColorForLine(index)}; ">`);
    });
    
    // Set the processed HTML
    const processedCode = processedLines.join('\n');
    
    // Update the DOM with the processed code
    if (codeContainer) {
      codeContainer.innerHTML = processedCode;
      preElement = codeContainer.querySelector('pre');
      
      // Add scroll event listener to detect when scrolling ends
      preElement.addEventListener('scroll', () => {
        if (!isScrolling) return;
        
        clearTimeout(preElement.scrollTimer);
        preElement.scrollTimer = setTimeout(() => {
          isScrolling = false;
          // Re-apply highlighting after scrolling ends
          if (highlightedLines && highlightedLines.lines) {
            applyHighlighting(highlightedLines.lines);
          }
        }, 150);
      });
    }
  });
</script>

<div class="code-block" bind:this={codeContainer} style="--code-height: {height};">

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
