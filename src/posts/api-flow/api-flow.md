---
title: Importing and parsing locally stored data files asynchronously with Node.js
description: A deep dive into the process, with explanation of best practices and error handling
date: '2025-2-21'
categories:
  - React
  - D3.js
published: true
---

<script lang="ts">
  import CodeContainer1 from './CodeContainer1.svelte';
  import CodeContainer2 from './CodeContainer2.svelte';
  import CodeContainer3 from './CodeContainer3.svelte';
</script>

<br/><br/>

In this post, we'll explore the backend implementation of this [interactive React dashboard](https://avosp.vercel.app/) that visualizes data of hundreds of research papers. I take a deep dive into the process of importing and parsing locally stored data files, in CSV, TSV and DOCX format, particularly focusing on asynchronous error handling.


## Fetching data in TSV format

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

## Fetching data in CSV format

<CodeContainer2></CodeContainer2>

## Fetching data in DOCX format

<CodeContainer3></CodeContainer3>


## Conclusion 



<br/><br/>

