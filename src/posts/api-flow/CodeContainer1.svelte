<script>
  import CodeBlock from '../../components/CodeBlock.svelte';
  import Steps from '../../components/Steps.svelte';
  import { arrayRange } from '../../lib/utils.ts'

  let stepsComponent;
  let codeBlockComponent;
  let highlightedLines = {};
  
  const code = `
const importScores = async (directory) => {

  if (!fs.existsSync(directory)) {
    throw new Error(\`Directory not found: \${directory}\`);
  }

  return new Promise((resolve, reject) => {
    let allData = [];

    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error('Score directory read error:', err);
        reject(err);
        return;
      }

      const fileReadPromises = files
        .filter(file => file.endsWith('.csv'))
        .map((file, index) => {
          return new Promise((res, rej) => {
            const filePath = path.join(directory, file);
            console.log(\`Processing score file: \${filePath}\`);
            
            const fileData = [];
            fs.createReadStream(filePath)
              .on('error', error => {
                console.error(\`Score file read error (\${file}):\`, error);
                rej(error);
              })
              .pipe(csv())
              .on('data', row => {
                const transformedRow = transformRow(row);
                transformedRow.sourceFile = index;
                fileData.push(transformedRow);
              })
              .on('end', () => {
                allData = [...allData, ...fileData];
                res();
              })
              .on('error', error => {
                console.error(\`CSV parsing error (\${file}):\`, error);
                rej(error);
              });
          });
        });

      Promise.all(fileReadPromises)
        .then(async () => {
          if (process.env.NODE_ENV !== 'production') {
            const fileNameOutput = path.join(__dirname, "data/output/scores_full.json");
            fs.writeFileSync(fileNameOutput, JSON.stringify(allData, null, 2));
          }
          resolve(allData);
        })
        .catch(error => {
          console.error('Score processing error:', error);
          reject(error);
        });
    });
  });
};
  `;

  const steps = [
  {
    title: "Directory Existence Check",
    descriptions: [
      "Checks if the specified directory exists using fs.existsSync()",
      "If the directory does not exist, it immediately throws an error. This is the first error handling mechanism, preventing the function from proceeding with an invalid directory."
    ],
    lines: arrayRange(3, 5, 1),
    descriptionLines: [[3], [4]],
    color: '#FF00FF'
  },
  {
    title: "Main Promise Structure",
    descriptions: [
      "The function returns a Promise, which will eventually resolve with the processed data or reject with an error"
    ],
    lines: [7],
    descriptionLines: [[7]],
    color: '#FFD700'
  },
  {
    title: "Data Storage and Directory Reading",
    descriptions: [
      "Initializes an empty array allData to store all processed data",
      "Uses fs.readdir() to read the contents of the directory asynchronously. If there is an error, it logs the error and rejects the main Promise with the error, returning the function early to prevent further execution.",
    ],
    lines: [8, 10, 11, 12, 13, 14, 15],
    descriptionLines: [[8], [10, 11, 12, 13, 14, 15]],
    color: '#00FFFF'
  },
  {
    title: "File Processing Setup",
    descriptions: [
      "Filters the directory contents to only include CSV files, to prevent any errors in data processing down the line.",
      "Maps each CSV file to a new Promise (creating an array of Promises)",
      "Tracks the file index for later reference"
    ],
    lines: arrayRange(17, 19, 1),
    descriptionLines: [[18], [19], [19]],
    color: '#BF00FF'
  },
  {
    title: "Individual File Processing",
    descriptions: [
      "Creates a new Promise for each file's processing",
      "Constructs the full file path using path.join()",
      "Initializes an array to store data from this specific file"
    ],
    lines: [20, 21, 22, 24],
    descriptionLines: [[20], [21], [24]],
    color: '#32CD32'
  },
  {
    title: "Read Stream Setup",
    descriptions: [
      "Creates a read stream for the file. If there's an error reading the file, it logs the error with the specific file name and context, then rejects the file's Promise with error.",
    ],
    lines: arrayRange(25, 29, 1),
    descriptionLines: [arrayRange(25, 29, 1)],
    color: '#FF00FF'
  },
  {
    title: "CSV Parsing",
    descriptions: [
      "Pipes the file content through a CSV parser",
      "For each row of CSV data, it transforms the row using a function called transformRow, then adds the transformed row to the file's data array.",
      "When CSV parsing is complete, it adds all rows from this file to the main allData array, before resolve this file's Promise",
      "If there's an error during CSV parsing, it rejects this file's Promise with the error"
    ],
    lines: arrayRange(30, 42, 1),
    descriptionLines: [[30], [31, 32, 33, 34, 35], [36, 37, 38], [39, 40, 41, 42]],
    color: '#FFD700'
  },
  {
    title: "Processing All Files",
    descriptions: [
      "Waits for all file processing Promises to complete using Promise.all()",
      "Resolves the main Promise with the complete dataset",
      "If any file processing Promise is rejected, it rejects the main Promise with the error."
    ],
    lines: arrayRange(47, 58, 1),
    descriptionLines: [[47], [53], [58]],
    color: '#00FFFF'
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
    {steps} 
    {stepsComponent}
    height="1400px"
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