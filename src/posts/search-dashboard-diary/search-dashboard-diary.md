---
title: Weekly Diary 1 - Designing and developing a search engine and results interface
description: A weekly diary to document the design and development process of a web application
date: '2024-8-18'
categories:
  - Nextjs
  - Tailwind CSS
published: true
thumbnail_url: "https://raw.githubusercontent.com/dianaow/er-network/main/userflow_er.gif"
---

<script lang="ts">
  import search_page1 from './images/search_page1.png'
  import search_page2 from './images/search_page2.png'
</script>

I have been building many MVPs and prototypes for clients from the ground up that I have decided to document/share my creation process of one such project in the form of a weekly diary. 

## What I will be building
A web-responsive search engine and results interface, with a network visualization dashboard.
The web application only has two screens, the search and dashboard page, and is served with mock data all imported from csv files (as of now). 

## Work Done
The design of the search page was done directly with code. I took inspiration from Vercel and Github's clean and light-themed site design.

I developed reusable form field components, such as text input, dropdowns, buttons and checkboxes. This was made much easier with the help of ChatGPT-4o. As an example here is the prompt I used to create the text input component.

> *"Create a reusable Next.js component to represent text input form fields only. It should allow for flexible design such as label and different field styles"*

```jsx (src/app/ui/components/TextInput.jsx)
import React from 'react';

const TextInput = ({
  label,
  labelClassName = '',
  inputClassName = '',
  containerClassName = '',
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  ...rest
}) => {
  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className={`mb-2 text-sm font-medium ${labelClassName}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClassName}`}
        {...rest}
      />
    </div>
  );
};

export default TextInput;
```
#### Usage example
```jsx (src/app/search/page.jsx)
  <div className="w-3/4">
    <TextInput
      label="Search words"
      name="tags"
      value={formData.tags}
      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
    />
  </div>
```

ChatGPT gave the output I wanted on the first try, I just had to modify it with my own Tailwind classes. I like the fact that it is very convenient to change the default styles by just specifying Tailwind classes when creating a new text input. 

I also designed a basic layout for the search results page, which rendered the table of results stacked on top of one another. There is going to be many tables in this app, so it makes sense to abstract it to a table component with advanced funtionality such as column sort and highlight options (and possibly new features down the road). Once again, I used ChatGPT-4o to help me with this through a sequence of prompts:

> *"Create a reusable Next.js table component to dynamically display rows and columns of data. Iterate over an array of objects to render each row in the table. Assign the column header based on the object keys. The table component can be opened or hidden from view through clicking a chevron on the top left corner, beside the title" *

I had to make another prompt to fix the chevron to make it what I want.

> *"Can you generate the chevron with SVG instead of using heroicons? The chevron should point to the right when the component is closed, and point downwards when the component is open."*

```jsx (src/app/ui/components/ToggleableTable.jsx)
import React, { useState } from 'react';

const ToggleableTable = ({
  data,
  title="",
  open=false
}) => {
  const [isOpen, setIsOpen] = useState(open);

  // Get table headers from the keys of the first object in the data array
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const toggleTable = () => {
    setIsOpen(!isOpen);
  }

  return (
    <div className="bg-white border-neutral-200 border rounded-lg p-4 w-full overflow-x-scroll">
      <div className="flex justify-start items-center cursor-pointer" onClick={toggleTable}>
        <button>
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
        <p className="text-xl pl-4">{title}</p>
      </div>
      {isOpen && (
        <table className="mt-4 border-collapse w-full">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className="border-b-2 p-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header} className="border-b p-2">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
      </table>
      )}
    </div>
  );
};

export default ToggleableTable;
```

Later on, the client requested further table column functionality, so within the same chat I wrote another prompt.

> *The ToggleableTable component has to have sort by value or alphabetical order functionality across all columns. However, this feature is optional. A column's values can be color coded based on a specified logic. There is different color coding rules for different columns."*

```jsx (src/app/ui/components/ToggleableTable.jsx)
  import React, { useState } from 'react';

  const ToggleableTable = ({ headers, data, sortableColumns = [], colorCodingRules = {} }) => {
    const [sortedData, setSortedData] = useState(data);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
    const [isOpen, setIsOpen] = useState(open);

    const toggleTable = () => {
      setIsOpen(!isOpen);
    }

    const handleSort = (header) => {
      if (!sortableColumns.includes(header)) return;

      const direction =
        sortConfig.key === header && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
      
      const sortedArray = [...sortedData].sort((a, b) => {
        if (a[header] < b[header]) return direction === 'ascending' ? -1 : 1;
        if (a[header] > b[header]) return direction === 'ascending' ? 1 : -1;
        return 0;
      });

      setSortedData(sortedArray);
      setSortConfig({ key: header, direction });
    };

    const applyColorCoding = (header, value) => {
      if (colorCodingRules[header]) {
        return colorCodingRules[header](value);
      }
      return '';
    };

    return (
      <div className="bg-white border-neutral-200 border rounded-lg p-4 w-full overflow-x-scroll">
        <div className="flex justify-start items-center cursor-pointer" onClick={toggleTable}>
          <button>
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
          <p className="text-xl pl-4">{title}</p>
        </div>
        {isOpen && (
          <table className="mt-4 border-collapse w-full">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className={`border-b-2 p-1 text-xs text-neutral-400 cursor-pointer ${
                      sortableColumns.includes(header) ? 'hover:text-blue-500' : ''
                    }`}
                    onClick={() => handleSort(header)}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index} className="hover:bg-neutral-200">
                  {headers.map((header) => (
                    <td
                      key={header}
                      className={`p-1 text-xs text-center ${applyColorCoding(header, row[header])}`}
                    >
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  export default ToggleableTable;
```

> Create a filled chevron beside the sortable column header that points downwards when sorted in descending order and points upwards when in ascending order

```jsx (src/app/ui/components/ToggleableTable.jsx)
  // rest of component...

  const getChevron = (header) => {
    if (sortConfig.key !== header) return null;

    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    // rest of component...
    <thead>
      <tr>
        {headers.map((header) => (
          <th
            key={header}
            className={`border-b-2 p-1 text-xs text-neutral-400 cursor-pointer ${
              sortableColumns.includes(header) ? 'hover:text-blue-500' : ''
            }`}
            onClick={() => handleSort(header)}
          >
            <span className="flex items-center justify-center">
              {header}
              {sortableColumns.includes(header) && (
                <span className="ml-1">{getChevron(header)}</span>
              )}
            </span>
          </th>
        ))}
      </tr>
  </thead>
  )
```

I think I should have included this sort option in my earlier prompt.

> How about if I want to include the option to sort based on a specified array of strings?

```jsx (src/app/ui/components/ToggleableTable.jsx)
  const handleSort = (header) => {
    if (!sortableColumns.includes(header)) return;

    const direction = sortConfig.key === header && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';

    const sortedArray = [...sortedData].sort((a, b) => {
      if (customSortOrders[header]) {
        // Custom sorting logic based on specified array of strings
        const order = customSortOrders[header];
        const aIndex = order.indexOf(a[header]);
        const bIndex = order.indexOf(b[header]);

        if (aIndex === -1 || bIndex === -1) {
          return direction === 'ascending' ? a[header].localeCompare(b[header]) : b[header].localeCompare(a[header]);
        }

        return direction === 'ascending' ? aIndex - bIndex : bIndex - aIndex;
      } else {
        // Default sorting logic
        if (a[header] < b[header]) return direction === 'ascending' ? -1 : 1;
        if (a[header] > b[header]) return direction === 'ascending' ? 1 : -1;
        return 0;
      }
    });

    setSortedData(sortedArray);
    setSortConfig({ key: header, direction });
  };
```

#### Usage example
```jsx 
  const headers = ['Name', 'Priority', 'Score'];
  const data = [
    { Name: 'Alice', Priority: 'High', Score: 85 },
    { Name: 'Bob', Priority: 'Low', Score: 90 },
    { Name: 'Charlie', Priority: 'Medium', Score: 78 },
  ];

  const colorCodingRules = {
    Score: (value) => {
      if (value > 80) return '#c6f7e2'; // light green background
      if (value <= 80) return '#f7c6c7'; // light red background
      return '';
    },
  };

  const customSortOrders = {
    Priority: ['High', 'Medium', 'Low'],
  };

  <ToggleableTable
    headers={headers}
    data={data}
    sortableColumns={['Name', 'Priority', 'Score']}
    colorCodingRules={colorCodingRules}
    customSortOrders={customSortOrders}
  />;
```

The client provided feedback that there isn't a need to display all search result information at once, and suggested tabs at the left side to show each table one at a time, which I will fix next week.

<figure>
  <img src={search_page1} alt="Search page 1"/>
</figure>

<figure>
  <img src={search_page2} alt="Search page 2"/>
</figure>

## Challenges faced
The client had no finalized form content and was undecided on what particulary form fields should be available to the app's user, so I had to modify the search page repeatedly. Creating reusable form components helped make adjustments convenient, but layout changes were more time-consuming as I had to modify the Tailwind classes of the parent divs wrapped around the form components multiple times.

The intricacies to create an aesthetic, professional-looking and intuitive form and table display, meant that I spent quite some time tweaking the design. Each table also has rich and different content to display.

## Lessons learned
I believe that I should be able to reuse each form components wholly for future projects, which is nice as it will definitely speed up the development process of prototypes. This is particularly helpful as it is always the case with clients in the MVP stage to be on a very tight budget and deadline, whilst demanding high design expectations (as they will be using the prototype I am building to pitch to potential investors and stakeholders), which comes along with it many rounds of design iterations with them. Being able to quickly have a baseline page setup to then dive into the details is definitely useful.

