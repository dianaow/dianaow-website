<script>
  import { onMount } from 'svelte';
  import { getHighlighter } from 'shiki'
  
  export let height = '720px';
  export let lang = 'javascript'
  export let steps = [];
  export let code = "";
  export let blockName = "";
  export let highlightedLines = {};

  let defaultCode = "";
  let highlightedCode;
  let codeContainer; // Bind to the outer container
  let isScrolling = false;

  function getColorForLine(lineNumber) {
    for (const step of steps) {
      if (step.lines.includes(lineNumber)) {
        return step.color;
      }
    }
    return null;
  }

  function defaultCodeStyle(code) {
    return code.split('\n').map((line, index) => {
      const highlightedLines = steps.find(step => step.lines.includes(index));
      return highlightedLines ? 
        `<span id="line-${index}" style="padding-left: 4px; border-left: 4px solid ${getColorForLine(index)}; background-color: #3a3659;">${line}</span>` :
        `<span id="line-${index}" style="padding-left: 8px;">${line}</span>`;
    }).join('\n');
  }

  function highlightCodeWithLines(code, lines) {
    return code.split('\n').map((line, index) => {
      return lines.lines.includes(index) ?
        `<span id="line-${index}" style="padding-left: 4px; border-left: 4px solid ${getColorForLine(index)}; background-color: #3a3659;">${line}</span>` :
        `<span id="line-${index}" style="padding-left: 8px;">${line}</span>`;
    }).join('\n');
  }

  let highlightTimeout;

  function updateHighlights() {
    // Clear any existing timeout
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }

    // Set new timeout for highlight update
    highlightTimeout = setTimeout(() => {
      isScrolling = false;
      if (Object.keys(highlightedLines).length > 0) {
        highlightedCode = highlightCodeWithLines(defaultCode, highlightedLines);
      }
    }, 350); // Adjust this delay as needed
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

    // preElement.addEventListener('scrollend', () => {
    //   updateHighlights();
    // }, { once: true });
  }

  onMount(async () => {
    const shikiHighlighter = await getHighlighter({
      themes: ['rose-pine-moon'],
      langs: ['javascript', 'typescript', 'svelte', 'python']
    });
    
    defaultCode = await shikiHighlighter.codeToHtml(code, { lang, theme: 'rose-pine-moon' });
    defaultCode = `<div>${blockName}</div>${defaultCode}`;
    highlightedCode = defaultCodeStyle(defaultCode);
  });
</script>

<div class="code-block" bind:this={codeContainer} style="--code-height: {height};">
  {@html highlightedCode}
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
