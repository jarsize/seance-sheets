# How Kiro was used to build Séance Sheets

Draft, updated as the build progresses. This is the source for the Kiro usage write-up on the Devpost submission form.

## Spec-driven development

The build started with a spec, not with code. `.kiro/specs/seance-sheets/` holds:

- `requirements.md`: 7 requirements in EARS format (WHEN/THEN/SHALL), covering upload and parsing, the sample dataset, plain-English questions, column matching, table and chart results, design and branding, and the no-backend constraint.
- `design.md`: the architecture (static site, component breakdown, query-engine pipeline, data model, correctness and testing strategy).
- `tasks.md`: a 10-task implementation plan with checkboxes, each task mapped to the requirements it satisfies. The plan is updated as tasks land.

Writing the spec first forced the hard decisions early: the query engine had to be deterministic (no runtime LLM, no API key), the sample dataset had to be identical in its JS and CSV forms, and the engine had to be DOM-free so the same code could run under Node tests. Those decisions shaped every file that followed.

## Steering docs

`.kiro/steering/` holds three short docs that keep every build step consistent:

- `product.md`: what the app is, who it is for, the core promise (ask a question, get a true answer), and what it is not.
- `tech.md`: the stack (static site, vendored SheetJS/PapaParse/Chart.js, Node only for tests) and conventions (no em dashes, no external images, no secrets in the repo).
- `structure.md`: the file layout and the rules that hold it together (engine stays DOM-free, the two sample-dataset copies stay in sync, `.kiro` is never gitignored).

## Agent hooks

`.kiro/hooks/` holds two hook definitions:

- `run-tests-on-save.json`: runs the Node query-engine test suite whenever a file under `js/` or `test/` is saved, so regressions in the deterministic query logic are caught immediately.
- `check-sample-data-sync.json`: after any edit to the sample dataset files, verifies the embedded JS dataset and the CSV file still contain the same rows.

## What was and was not run through Kiro

Honest status, updated 2026-11-18:

- The spec, steering docs, and hook definitions above were authored as genuine project artifacts for this build, following Kiro's spec-driven development workflow (requirements, design, tasks). The hook files use the official v1 schema (verified against kiro.dev/docs/hooks), and the steering files carry `inclusion: always` front matter per the steering docs.
- Kiro CLI 3.5.0 is installed on the build machine (installed 2026-11-18 from the official installer at cli.kiro.dev). Authentication needs one human step: the CLI uses OAuth device flow on a headless machine (`kiro-cli login --use-device-flow` prints a URL and a one-time code, entered in any browser). That step belongs to John and is pending. Once authenticated, at least one real headless Kiro run will be executed against this repo (for example, running the test suite through Kiro and having it verify the spec-to-code trace), and the session/stream-json log will be kept as evidence.
- No MCP servers were needed for this build: the app is a static site with no external data source, so `.kiro/settings/mcp.json` is intentionally absent. No custom agents or Kiro powers were needed either; the build used spec-driven development, steering, and hooks.
