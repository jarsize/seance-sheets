# Séance Sheets

Summon answers from your spreadsheet.

Half the workforce lives in spreadsheets, but most people cannot ask them a question. Séance Sheets is for the small business owner, the teacher, the nonprofit volunteer, anyone who has data and questions but no time for formulas: upload a CSV or Excel (.xlsx) file, ask a plain-English question about it ("What were total sales by month?", "Which product sold best?"), and get an answer as a table plus a chart. No backend, no API key, no login. Everything runs in your browser, and your file never leaves your machine.

Built for [Kiroween 2026](https://kiroween.devpost.com/) (Frankenstein category) by John Goliash of [Win Twin](https://wint.win).

## Try it

Live site: **https://seance.xyx.me/**

Click "Load sample data" to try it with zero upload: a haunted pumpkin-patch sales dataset is built in.

Or serve it locally:

```sh
python3 -m http.server
```

Then open http://localhost:8000.

## What it does

- **Upload your own data.** Drag and drop a .csv or .xlsx file, or pick one with the file picker. The app shows the columns, row count, and a 5-row preview.
- **Ask in plain English.** Sum, average, count, min, max, group-by, top-N rankings, and filters. Examples:
  - "What was total revenue?"
  - "Total revenue by product"
  - "Top 3 products by revenue"
  - "Average quantity by patch location"
  - "Revenue in October"
  - "Show sales where weather was foggy"
- **See the answer.** Results render as a table and a chart (bar for grouped results, line for date/month grouping), with values labeled on the chart. Money columns are formatted with dollar signs. The app states in plain words what it understood, so you can check it.
- **Honest when unsure.** If a question cannot be understood, the app says so and suggests example questions instead of guessing. Example questions adapt to the columns of whatever file you loaded.

## How the query engine works

The natural-language engine is deterministic logic, not a runtime LLM call. It normalizes the question, detects the operation (sum, average, count, min, max), top-N, group-by, and filters by keyword, resolves column references by fuzzy name matching plus a synonym map ("sales" means Revenue, "items" means Quantity), executes the query, and returns the result with a plain-words interpretation. There is no API key and no network call at runtime.

Why deterministic? An LLM can hallucinate a number and sound confident about it. This engine parses the question and runs the arithmetic, so the answer is exact and reproducible, and the interpretation line lets you verify what it did.

## Tech

- Static site: HTML, CSS, plain JavaScript. No build step, no backend.
- [SheetJS](https://sheetjs.com/) for .xlsx parsing, [PapaParse](https://www.papaparse.com/) for CSV parsing, [Chart.js](https://www.chartjs.org/) for charts. All three are vendored in `vendor/`, so the app has no runtime CDN dependency.
- Node.js is used only for the query-engine test suite.

## Tests

```sh
node test/query-engine.test.js
```

The suite loads the sample dataset and asserts exact results for representative questions, including totals, group-by, top-N, filters, and the unparseable-question path.

## Project layout

```
index.html                  Page structure
css/style.css               Theme and layout
js/app.js                   UI wiring (upload, sample loading, rendering)
js/query-engine.js          Deterministic NL parsing + execution (Node-testable)
js/sample-data.js           Built-in dataset (embedded rows)
data/sample-pumpkin-patch-sales.csv   Same dataset as CSV
vendor/                     SheetJS, PapaParse, Chart.js (minified)
test/query-engine.test.js   Node tests for the query engine
docs/kiro-usage.md          How Kiro was used to build this project
.kiro/                      Spec, steering docs, and agent hooks
CNAME                       Custom domain (seance.xyx.me)
favicon.svg                 Ghost favicon
```

## Kiro

This project was built with spec-driven development in Kiro: the spec lives in `.kiro/specs/seance-sheets/` (requirements, design, tasks), steering docs in `.kiro/steering/`, and agent hooks in `.kiro/hooks/`. See `docs/kiro-usage.md` for the full write-up of which Kiro features were used and how they shaped the build.

## License

MIT. See LICENSE.
