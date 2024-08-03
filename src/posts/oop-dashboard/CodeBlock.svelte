<script>
  import { onMount } from 'svelte';
  import { getHighlighter } from 'shiki'

  export let lang = 'javascript'
  export let steps = [];
  export let code = "";
  export let blockName = "";
  export let highlightedLines = {};

  let defaultCode = "";
  let highlightedCode;

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
      return highlightedLines ? `<span style="padding-left: 4px; border-left: 4px solid ${getColorForLine(index)};">${line}</span>` : `<span style="padding-left: 8px;">${line}</span>`;
    }).join('\n');
  }

  function highlightCodeWithLines(code, lines) {
    return code.split('\n').map((line, index) => {
      return lines.lines.includes(index) ? `<span style="padding-left: 4px; border-left: 4px solid ${getColorForLine(index)}; background-color: navy;">${line}</span>` : `<span style="padding-left: 8px;">${line}</span>`;
    }).join('\n');
  }

  onMount(async () => {
    const shikiHighlighter = await getHighlighter({
      themes: ['rose-pine-moon'],
      langs: ['javascript', 'typescript', 'svelte', 'python']
    })
    defaultCode = await shikiHighlighter.codeToHtml(code, { lang , theme: 'rose-pine-moon'});
    defaultCode = `<div>${blockName}</div>${defaultCode}`;
    highlightedCode = defaultCodeStyle(defaultCode)
  });

  $: (Object.keys(highlightedLines).length > 0 && highlightedLines?.lines.length > 0) && (highlightedCode = highlightCodeWithLines(defaultCode, highlightedLines));

  $: (Object.keys(highlightedLines).length > 0 && highlightedLines?.lines.length === 0) && (highlightedCode = defaultCodeStyle(defaultCode));

</script>

<div class="code-block">
  {@html highlightedCode}
</div>

<style>
  .code-block {
    overflow-y: scroll;
    min-width: 50%;
    max-height: 600px;
  }
  .code-block-title {
    margin-top: 0em !important;
  }
</style>