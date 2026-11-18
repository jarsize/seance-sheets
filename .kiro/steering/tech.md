# Tech: Séance Sheets

## Stack

- Static site, no build step, no backend, no bundler. Plain HTML, CSS, and JavaScript served as files (GitHub Pages).
- SheetJS (xlsx) for .xlsx parsing, PapaParse for CSV parsing, Chart.js for charts. All three are vendored into `vendor/` so the app has no runtime CDN dependency.
- Node.js (v24) for the query-engine test suite only. The app itself does not need Node to run.

## Conventions

- The query engine (`js/query-engine.js`) is pure functions with no DOM access, so the same code runs in the browser and under Node tests. Keep it that way: UI code lives in `js/app.js`, logic lives in the engine.
- No em dashes anywhere in UI text, code comments, or docs. Use commas, periods, colons, or parentheses.
- No external images. Decorative elements are CSS or inline SVG only.
- No secrets, API keys, or credentials anywhere in the repo.

## Commands

- Run tests: `node test/query-engine.test.js`
- Serve locally: `python3 -m http.server` from the project root, then open http://localhost:8000
