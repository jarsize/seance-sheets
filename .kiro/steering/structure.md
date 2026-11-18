---
inclusion: always
---

# Structure: Séance Sheets

```
seance-sheets/
  index.html                  Page structure
  css/style.css               Theme and layout
  js/app.js                   UI wiring (upload, sample loading, rendering)
  js/query-engine.js          Deterministic NL parsing + execution (Node-testable)
  js/sample-data.js           Built-in dataset (embedded rows)
  data/sample-pumpkin-patch-sales.csv   Same dataset as CSV
  vendor/                     SheetJS, PapaParse, Chart.js (minified)
  test/query-engine.test.js   Node tests for the query engine
  docs/kiro-usage.md          Kiro usage write-up for the submission
  .kiro/
    specs/seance-sheets/      requirements.md, design.md, tasks.md
    steering/                 product.md, tech.md, structure.md
    hooks/                    agent hook definitions
  README.md
  LICENSE                     MIT
```

## Rules

- Keep the query engine free of DOM access so tests can import it under Node.
- Keep the sample dataset identical in `js/sample-data.js` and `data/sample-pumpkin-patch-sales.csv`. If one changes, change the other.
- Never add `.kiro` to `.gitignore`. The Kiroween rules require it in the repo.
