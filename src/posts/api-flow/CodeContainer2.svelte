<script>
  import CodeBlock from '../../components/CodeBlock.svelte';
  import Steps from '../../components/Steps.svelte';
  import { arrayRange } from '../../lib/utils.ts'

  let stepsComponent;
  let codeBlockComponent;
  let highlightedLines = {};
  
  const code = `
const fileReadPromises = files
  .filter(file => file.endsWith('.tsv'))
  .map((file, index) => {
    return new Promise((res, rej) => {
      const filePath = path.join(directory, file);
      console.log(\`Processing file: \${filePath}\`);

      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
          console.error(\`File read error (\${file}):\`, err);
          rej(err);
          return;
        }

        try {
          const lines = data.trim().split("\\n");
          const headers = lines[0].split("\\t");
          const fileData = lines.slice(1).map(line => {
            const values = line.split("\\t");
            const obj = {};
            headers.forEach((header, i) => obj[header] = values[i]);
            obj.sourceFile = index;
            return obj;
          });

          allData = [...allData, ...fileData];
          res();
        } catch (parseError) {
          console.error(\`Parse error (\${file}):\`, parseError);
          rej(parseError);
        }
      });
    });
  });
`;

  const steps = [
  {
    title: "Parsing TSV file",
    descriptions: [
      "Splits the text into an array of lines using newline characters. Each element in lines represents one row from the file.",
      "Takes the first line (index 0) which contains the column headers, splits it by tab characters (\t) to get an array of header names.",
      "slice(1) skips the header row and takes all remaining lines. map() processes each line into an object.",
      "Splits each line by tabs to get the values, then pairs each header with its corresponding value using the same index position"
    ],
    lines: arrayRange(16, 24, 1),
    descriptionLines: [[16], [17], [18], [19, 20, 21]],
    color: '#FF00FF'
  }
];

  function handleHighlight(event) {
    highlightedLines = event.detail;
  }

  function handleScroll(event) {
    if (codeBlockComponent) {
      codeBlockComponent.scrollToLine(
        event.detail.line, 
        event.detail.stepPosition,
        event.detail.highlightId
      );
    }
  }
</script>

<div class="container-code">
  <CodeBlock 
    bind:this={codeBlockComponent}
    {code} 
    {highlightedLines} 
    {stepsComponent}
    {steps} 
  />
  <Steps 
    bind:this={stepsComponent}
    {steps} 
    on:highlight={handleHighlight} 
    on:scroll={handleScroll}
  />
</div>

<style>
	.container-code {
		display: flex;
		width: 100%;
		margin: 2.5rem 0rem 3.5rem 0rem;
	}
</style>
