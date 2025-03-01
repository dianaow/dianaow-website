<script>
  import CodeBlock from '../../components/CodeBlock.svelte';
  import Steps from '../../components/Steps.svelte';
  import { arrayRange } from '../../lib/utils.ts'

  let stepsComponent;
  let codeBlockComponent;
  let highlightedLines = {};
  
  const code = `
const importFromGoogleSheets = async (spreadsheetId, sheetNames) => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    // Verify required credential fields
    const requiredFields = ['client_email', 'private_key', 'project_id'];
    requiredFields.forEach(field => {
      if (!credentials[field]) {
        throw new Error(\`Missing required credential field: \${field}\`);
      }
    });
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    let allData = [];

    try {
      await sheets.spreadsheets.get({
        spreadsheetId,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new Error(\`Spreadsheet ID \${spreadsheetId} not found or not accessible. Make sure you've shared it with \${credentials.client_email}\`);
      }
      throw error;
    }

    for (const sheetName of sheetNames) {
      try {
        console.log(\`Fetching data from sheet: \${sheetName}\`);
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: \`\${sheetName}!A:Z\`,
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) {
          console.warn(\`No data found in sheet: \${sheetName}\`);
          continue;
        }

        const headers = rows[0];
        const sheetData = rows.slice(1).map((row, index) => {
          let obj = {};
          headers.forEach((header, i) => obj[header] = row[i] || '');
          obj.sourceFile = sheetName; // Track which sheet the row came from
          obj = transformRow(obj);
          return obj;
        });
        
        allData = [...allData, ...sheetData];

      } catch (error) {
        console.error(\`Error fetching sheet \${sheetName}:\`, error.message);
        throw new Error(\`Failed to fetch sheet "\${sheetName}": \${error.message}\`);     
      }
    }

    return { papers: allData };
  } catch (error) {
    const errorMessage = \`
      Google Sheets import failed: \${error.message}
    \`;
    throw new Error(errorMessage);
  }
};
  `;

  const steps = [
  {
    title: "Authentication",
    descriptions: [
      "Parses Google API credentials from an environment variable",
      "Verifies that essential credential fields exist (client_email, private_key, project_id), and throws an error if any required field is missing",
      "Creates a Google Auth instance with the credentials, requesting read-only access to Google Sheets via the specified scope"
    ],
    lines: arrayRange(3, 16, 1),
    descriptionLines: [[3], [6,7,8,9,10], [13,14,15,16]],
    color: '#FF00FF'
  },
  {
    title: "API Client Connection",
    descriptions: [
      "Creates a Google Sheets API client (v4) with the authentication",
      "Verifies the spreadsheet exists and is accessible"
    ],
    lines: [18, 23,24,25],
    descriptionLines: [[18], [23,24,25]],
    color: '#FFD700'
  },
  {
    title: "Spreadsheet Processing",
    descriptions: [
      "Iterates through each requested sheet name. For each sheet, requests data from range of columns specified",
      "Checks if data exists with at least headers and one row",
      "Converts rows to objects using headers as keys and transforms each row using an external transformRow function"
    ],
    lines: arrayRange(33, 62, 1),
    descriptionLines: [[33, 36, 37, 38, 39], [41, 42, 43, 44, 45], [50]],
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
