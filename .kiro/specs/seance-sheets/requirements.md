# Requirements: Séance Sheets

Project: Séance Sheets, a Kiroween 2026 hackathon entry (Frankenstein category).
Author: John Goliash (Win Twin), with Kiro-assisted development.
Created: 2026-11-18. Submission deadline: 2026-12-04 5:00 PM ET.

## Introduction

Séance Sheets is a client-side-only web app. A user uploads a spreadsheet (CSV or .xlsx), asks plain-English questions about it, and gets answers as a table plus a chart. There is no backend, no API key, and no login, so anyone (including hackathon judges) can open the page and test it immediately. A built-in sample dataset (haunted pumpkin-patch sales) makes the app demonstrable with zero upload. The natural-language query engine is deterministic logic, not a runtime LLM call.

## Glossary

- Dataset: the rows and columns currently loaded, either from an uploaded file or the built-in sample.
- Query engine: the deterministic module that parses a plain-English question into a structured query and executes it against the dataset.
- Structured query: an object describing an operation (sum, average, count, min, max), a target column, an optional group-by column, an optional top-N limit, and optional filters.
- Result: the computed answer, rendered as a table and a chart, plus a plain-words statement of what was understood.

## Requirements

### Requirement 1: File upload and parsing

User Story: As a user, I want to upload my spreadsheet so I can ask questions about my own data.

#### Acceptance Criteria

1. WHEN the user drops a .csv file onto the drop zone or picks one with the file picker, THEN the app SHALL parse it with PapaParse and load it as the current dataset.
2. WHEN the user drops a .xlsx file onto the drop zone or picks one with the file picker, THEN the app SHALL parse the first worksheet with SheetJS and load it as the current dataset.
3. WHEN a dataset is loaded, THEN the app SHALL show the column names, the row count, and a preview of the first 5 rows.
4. WHEN a file cannot be parsed or has no data rows, THEN the app SHALL show a clear error message and keep the previous dataset (if any) loaded.
5. WHEN a file with an unsupported extension is offered, THEN the app SHALL reject it with a message naming the accepted formats (.csv, .xlsx).

### Requirement 2: Built-in sample dataset

User Story: As a first-time visitor, I want the app to work immediately without uploading anything, so I can see what it does.

#### Acceptance Criteria

1. WHEN the user clicks "Load sample data", THEN the app SHALL load the built-in haunted pumpkin-patch sales dataset (at least 60 rows, Sep-Oct 2026) without any file upload.
2. WHEN the sample dataset is loaded, THEN it SHALL contain the columns Date, Product, Quantity, Unit Price, Revenue, Patch Location, and Weather.
3. WHEN the sample dataset is loaded, THEN every row SHALL satisfy Revenue = Quantity * Unit Price.
4. WHEN the page loads, THEN the sample dataset SHALL be offered prominently and the same data SHALL be available as a downloadable CSV file in the repo (data/sample-pumpkin-patch-sales.csv).

### Requirement 3: Plain-English questions

User Story: As a user, I want to ask questions in plain English so I do not need to learn a query language.

#### Acceptance Criteria

1. WHEN the user asks for a sum, average, count, minimum, or maximum of a numeric column, THEN the query engine SHALL compute it and return a single-value result.
2. WHEN the user asks for an aggregate grouped by a categorical column, THEN the query engine SHALL return one row per group value.
3. WHEN the user asks for a top-N ranking, THEN the query engine SHALL return the top N groups ordered by the requested aggregate.
4. WHEN the user asks with a filter condition (a value match or a month reference), THEN the query engine SHALL apply the filter before aggregating.
5. WHEN the user asks to see the data itself ("show all", "show the data"), THEN the query engine SHALL return the rows as a table.
6. WHEN the user asks a question the engine cannot parse, THEN the app SHALL say so plainly and show example questions instead of guessing an answer.

### Requirement 4: Column matching

User Story: As a user, I want the app to understand my words for columns, so I do not need to type exact header names.

#### Acceptance Criteria

1. WHEN a question contains a word matching a column name (case-insensitive, partial match allowed), THEN the engine SHALL resolve it to that column.
2. WHEN a question uses a synonym (for example "sales" for Revenue, "items" for Quantity, "price" for Unit Price, "where" for Patch Location), THEN the engine SHALL resolve it to the mapped column.
3. WHEN a question mentions no resolvable column for an aggregate, THEN the engine SHALL ask the user to name a column instead of picking one silently.

### Requirement 5: Results as table and chart

User Story: As a user, I want answers I can read and see, so I can understand the result at a glance.

#### Acceptance Criteria

1. WHEN a query returns rows, THEN the app SHALL render them as a clean HTML table.
2. WHEN a query returns grouped or ranked rows, THEN the app SHALL also render a Chart.js chart.
3. WHEN the grouping is by date or month, THEN the chart SHALL be a line chart; otherwise grouped results SHALL use a bar chart.
4. WHEN a result is shown, THEN the app SHALL state in plain words what was understood (for example "Summing Revenue grouped by Product").
5. WHEN a query returns a single value, THEN the app SHALL show the value prominently with its label and unit context.

### Requirement 6: Design and branding

User Story: As a user, I want a polished, memorable interface so the app feels finished and fun to use.

#### Acceptance Criteria

1. WHEN the page loads, THEN it SHALL present a dark, spooky-but-polished theme (dark background, purple and green ghost accents) with the title "Séance Sheets" and the tagline "Summon answers from your spreadsheet."
2. WHEN the page is viewed on a narrow screen, THEN the layout SHALL remain usable (single column, readable text, reachable controls).
3. WHEN the page footer is shown, THEN it SHALL read "Built by Win Twin" with a link to https://wint.win.
4. WHEN decorative elements are used, THEN they SHALL be CSS or inline SVG only, with no external images.

### Requirement 7: No backend, no keys, no login

User Story: As a judge or visitor, I want the app to work the moment the page opens, with no setup.

#### Acceptance Criteria

1. WHEN the page loads, THEN all processing SHALL happen in the browser; the app SHALL make no network request other than loading its own static assets.
2. WHEN the app runs, THEN it SHALL require no API key, account, or sign-in.
3. WHEN the app is served as static files (for example GitHub Pages), THEN every feature SHALL work without a build step or server-side code.
