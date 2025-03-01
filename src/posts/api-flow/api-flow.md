---
title: Importing and parsing locally stored data files and data from Google Sheets API asynchronously with Node.js
description: A deep dive into the process, with explanation of best practices and error handling
date: '2025-2-28'
categories:
  - Node.js
published: true
---

<script lang="ts">
  import CodeContainer1 from './CodeContainer1.svelte';
  import CodeContainer2 from './CodeContainer2.svelte';
  import CodeContainer3 from './CodeContainer3.svelte';
</script>

<br/><br/>

In this post, we'll explore the backend implementation of this [interactive React dashboard](https://dianaow.com/posts/react-data-dashboard) that visualizes data of hundreds of research papers. I take a deep dive into the process of importing and parsing locally stored data files and data from Google Sheets API, in CSV or TSV format, particularly focusing on asynchronous error handling.


## Fetching locally stored data in CSV format

<CodeContainer1></CodeContainer1>

Summary of Error Catchment Points
- Directory Check: Throws an error if the directory doesn't exist
- Directory Reading: Catches and logs errors when reading the directory contents
- File Reading: Catches and logs errors when opening or reading individual files
- CSV Parsing: Catches and logs errors during the CSV parsing process
- Overall Processing: Catches and logs any errors that occur during the overall processing

This robust error handling ensures that:
- Each potential failure point is properly handled
- Errors are logged with context information
- The function fails gracefully with appropriate error messages
- Processing continues for other files even if one file fails

## Fetching locally stored in TSV format

TSV format offers advantages over CSV when handling data containing commas in text fields or numeric values. Since CSV files use commas as delimiters, values like '1,000.50' or text containing natural commas require special escaping to prevent parsing errors. TSV files avoid this issue by using tabs as delimiters, which rarely occur in the actual data.

Similar code as with CSV format, except for the parsing of the file content.

<CodeContainer2></CodeContainer2>

## Fetching data from Google Sheets API

This approach allows for real-time data updates without requiring application redeployment, making it especially valuable for clients who are unfamiliar with the technical aspects of deployment processes.

<CodeContainer3></CodeContainer3>

### How to Connect to Google Sheets API

#### Set Up a Google Cloud Project

- Go to the Google Cloud Console
- Create a new project or select an existing one
- Enable the Google Sheets API for your project:
  - Navigate to "APIs & Services" > "Library"
  - Search for "Google Sheets API"
  - Click "Enable"

<br>

#### Create Service Account Credentials

- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "Service Account"
- Fill in the service account details and click "Create"
- Grant appropriate roles (basic Viewer role is sufficient for read-only access)
- Click on the created service account and go to the "Keys" tab
- Click "Add Key" > "Create new key"
- Choose JSON format and click "Create"
- The key file will be downloaded to your computer

<br>

#### Share Your Spreadsheet

- Open the Google Spreadsheet you want to access and click the "Share" button
- Add the service account email (found in the JSON file under client_email)
- Set appropriate permissions (Viewer for read-only)

<br>

> Ensure that it the file is a native Google Sheet, not an Excel file stored in Google Drive. To convert the file to Google Sheets format: Click File → Save as Google Sheets

<br>

#### Setup in Your Project

- Store the entire JSON content as an environment variable
```
  GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"...","client_id":"...",...}'
```

- Install Required Packages
```npm install googleapis```

Use the `importFromGoogleSheets` function shown above, with your specific spreadsheet ID. The spreadsheet ID is in the URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit

## Conclusion
Once files are imported and parsed, Node.js API routes can be established to transmit data to the frontend, with built-in parameter support for dynamic data filtering.

<br>
