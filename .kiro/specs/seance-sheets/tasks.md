# Implementation Plan: Séance Sheets

Created: 2026-11-18. Internal target: feature-complete by 2026-12-02. Submission deadline: 2026-12-04 5:00 PM ET.

Status key: [ ] not started, [~] in progress, [x] done.

## Tasks

- [x] 1. Write the spec (requirements, design, tasks) and steering docs in .kiro
  - Requirements in EARS format, design doc, this task list
  - _Requirements: all_

- [x] 2. Scaffold the static site and vendor libraries
  - index.html, css/style.css, js/app.js, js/query-engine.js, js/sample-data.js
  - Download SheetJS, PapaParse, Chart.js minified distributions into vendor/
  - _Requirements: 1.1, 1.2, 7.3_
  - Done 2026-11-18. All three libraries vendored; static-server smoke check returns 200 for every asset.

- [x] 3. Build the sample dataset
  - 60+ rows, Sep-Oct 2026, columns Date, Product, Quantity, Unit Price, Revenue, Patch Location, Weather
  - Same data embedded in js/sample-data.js and saved as data/sample-pumpkin-patch-sales.csv
  - Revenue = Quantity * Unit Price in every row
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - Done 2026-11-18. 66 rows in both copies; revenue totals match exactly ($10,743.75).

- [~] 4. Build the file upload and data loader
  - Drag-and-drop zone plus file picker for .csv and .xlsx
  - PapaParse for CSV, SheetJS first worksheet for .xlsx
  - Column names, row count, 5-row preview; clear errors on bad files
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - Code written 2026-11-18; browser verification of real uploads still pending (task 9).

- [x] 5. Build the deterministic query engine
  - Operation detection (sum, average, count, min, max), top-N, group-by, filters
  - Fuzzy column matching plus synonym map
  - Plain-words interpretation string; friendly error for unparseable questions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3_
  - Done 2026-11-18. Verified by the Node test suite (17/17 passing).

- [~] 6. Build results rendering
  - HTML table for rows, Chart.js chart for grouped/ranked results
  - Line chart for date/month grouping, bar chart otherwise
  - Single values shown prominently
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - Code written 2026-11-18; chart rendering verified only by engine tests so far, browser check pending (task 9).

- [~] 7. Build the UI and example questions
  - Dark spooky theme, responsive layout, ghost/pumpkin CSS/SVG motif
  - Example-question chips that fill the input and run the query
  - Footer: "Built by Win Twin" linking to https://wint.win
  - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - Code written 2026-11-18; visual check pending (task 9).

- [x] 8. Write and run the Node test suite for the query engine
  - At least 8 representative questions with exact numeric assertions
  - All tests passing before the submission is prepared
  - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - Done 2026-11-18. 17 tests, 17 passing.

- [~] 9. Verify the built app end to end
  - Static-server smoke check (HTTP 200, title string present)
  - Manual browser check: upload real CSV and XLSX, run example questions, confirm table and chart
  - Fresh-clone check: the site works from a clean checkout with no extra setup
  - _Requirements: 7.1, 7.2, 7.3_
  - Static check done 2026-11-18 (all 10 asset paths 200, title correct, Win Twin link present). Browser and fresh-clone checks pending.

- [ ] 10. Prepare the repo for submission
  - Public GitHub repo under @jarsize with MIT license, README, and this .kiro directory
  - GitHub Pages live and serving the app
  - Kiro usage write-up drafted (docs/kiro-usage.md)
  - Write-up drafted 2026-11-18. Repo creation blocked: no GitHub token available to the build agent; needs John to create the repo in the browser as @jarsize.
