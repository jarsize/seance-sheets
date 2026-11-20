# Design: Séance Sheets

Created: 2026-11-18. Status: draft, being implemented.

## Overview

Séance Sheets is a static single-page web app. All code runs in the browser. The user loads a dataset (upload or built-in sample), types a plain-English question, and the deterministic query engine parses the question, executes it against the dataset, and renders a table and a chart.

There is no backend, no runtime LLM, and no network call beyond loading the page's own static assets. Third-party libraries (SheetJS, PapaParse, Chart.js) are vendored into the repo so the app has no CDN dependency at runtime.

## Architecture

```
index.html            Page structure, drop zone, question input, results area
css/style.css         Dark spooky theme, responsive layout
js/app.js             UI wiring: upload handling, sample loading, rendering results
js/query-engine.js    Deterministic NL parsing + query execution (Node-testable)
js/sample-data.js     Built-in pumpkin-patch dataset (embedded rows)
data/sample-pumpkin-patch-sales.csv   Same dataset as a downloadable CSV
vendor/               SheetJS, PapaParse, Chart.js (minified distributions)
test/query-engine.test.js   Node tests for the query engine
```

## Components

### Data loader (js/app.js)

- Accepts a File from drag-and-drop or the file picker.
- Routes .csv to PapaParse (header row enabled, dynamic typing, skip empty lines) and .xlsx to SheetJS (first worksheet, sheet_to_json).
- Normalizes the result into `{ columns: string[], rows: object[] }`.
- Detects numeric columns by sampling values, so the query engine knows which columns can be summed or averaged.
- On parse failure, surfaces the error message and keeps the previous dataset.

### Query engine (js/query-engine.js)

Pure functions, no DOM access, so the same code runs in the browser and under Node for tests.

Pipeline:
1. Normalize the question (lowercase, trim, collapse whitespace).
2. Detect the operation by keyword: sum/total, average/avg/mean, count/how many, min/lowest, max/highest/best. Default to "show rows" when no aggregate keyword is present.
3. Detect top-N ("top 3", "best 5") and extract N.
4. Detect group-by: "by <column>", "per <column>", "for each <column>".
5. Detect filters: "where <column> is <value>", "in <month>", "for <value>" value matches against categorical columns.
6. Resolve column references: exact/partial match against column names, then a synonym map (sales/revenue, items/quantity, price/unit price, location/patch location, date/month, weather/conditions, product/item).
7. Execute: filter rows, group, aggregate, sort, limit.
8. Return `{ interpretation: string, columns: string[], rows: object[][], chart: { type, labels, values, label } | null }`.

If any step cannot resolve (unknown column, ambiguous reference), the engine returns an error object with a helpful message instead of guessing.

### Chart rendering (js/app.js)

- Uses Chart.js. Bar chart for grouped/top-N results, line chart when the group column is date-like, no chart for single-value results (the value is shown large instead).
- Destroys the previous chart instance before creating a new one.
- Chart colors use the theme palette (purple and green accents on dark).

### Sample dataset (js/sample-data.js + data/sample-pumpkin-patch-sales.csv)

- 60+ rows, dates across September and October 2026.
- Products: Jack-o'-Lantern Pumpkin, Ghost Gourd, Witch's Broom Corn, Candy Corn (lbs), Haunted Hay Bale.
- Patch Locations: 3 named patches. Weather: Sunny, Foggy, Rainy, Windy.
- Revenue is computed as Quantity * Unit Price in every row. The CSV file and the embedded JS rows contain the same data.

## Data model

A dataset is `{ columns, rows }` where each row is an object keyed by column name. Values are strings or numbers (PapaParse dynamic typing and SheetJS produce numbers for numeric cells). Dates stay as ISO strings ("2026-10-03"); month grouping derives "2026-10" from the date prefix.

## Correctness

- The Node test suite (test/query-engine.test.js) loads the sample dataset and asserts exact results for representative questions: total revenue, revenue by product, top 3 products by revenue, average quantity, row count, October revenue, filtered queries, and the unparseable-question error path.
- The sample CSV and the embedded JS dataset are generated from the same source of truth so they cannot drift.

## Testing strategy

- Node tests for the query engine (deterministic, exact numeric assertions).
- Static-server smoke check: serve the directory, curl the page, confirm HTTP 200 and the title string.
- Manual browser check by the author before submission (upload a real CSV and XLSX, ask the example questions, confirm table and chart render).
