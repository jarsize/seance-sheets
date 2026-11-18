// Node tests for the Séance Sheets query engine.
// Run: node test/query-engine.test.js
// Loads the sample dataset from the CSV file (same data as js/sample-data.js)
// and asserts correct results for representative questions.

const fs = require('fs');
const path = require('path');
const qe = require('../js/query-engine.js');

const csvPath = path.join(__dirname, '..', 'data', 'sample-pumpkin-patch-sales.csv');
const lines = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
const columns = lines[0].split(',');

// Minimal CSV parse for the test file (sample values contain no quoted commas
// except inside product names like "Jack-o'-Lantern Pumpkin", which is fine:
// commas only separate fields here).
function parseRow(line) {
  const out = [];
  let cur = '', inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

const rows = lines.slice(1).map((line) => {
  const vals = parseRow(line);
  const obj = {};
  columns.forEach((c, i) => {
    let v = vals[i];
    if (c === 'Quantity') v = parseInt(v, 10);
    if (c === 'Unit Price' || c === 'Revenue') v = parseFloat(v);
    obj[c] = v;
  });
  return obj;
});

// Ground truth computed directly from the rows.
const totalRevenue = rows.reduce((a, r) => a + r.Revenue, 0);
const avgQuantity = rows.reduce((a, r) => a + r.Quantity, 0) / rows.length;
const octRows = rows.filter((r) => r.Date.startsWith('2026-10'));
const octRevenue = octRows.reduce((a, r) => a + r.Revenue, 0);
const foggyRows = rows.filter((r) => r.Weather === 'Foggy');
const byProduct = {};
rows.forEach((r) => { byProduct[r.Product] = (byProduct[r.Product] || 0) + r.Revenue; });
const top3 = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 3);
const maxRevenue = Math.max(...rows.map((r) => r.Revenue));
const minQty = Math.min(...rows.map((r) => r.Quantity));

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const close = typeof expected === 'number'
    ? Math.abs(actual - expected) < 0.01
    : JSON.stringify(actual) === JSON.stringify(expected);
  if (close) { passed++; console.log('PASS  ' + name); }
  else {
    failed++;
    console.log('FAIL  ' + name);
    console.log('      expected: ' + JSON.stringify(expected));
    console.log('      actual:   ' + JSON.stringify(actual));
  }
}

function ask(q) {
  const res = qe.answerQuestion(rows, columns, q);
  if (!res.ok) {
    failed++;
    console.log('FAIL  "' + q + '" -> engine error: ' + res.message);
    return null;
  }
  return res;
}

// 1. Total revenue (sum of a numeric column).
let r = ask('What is the total revenue?');
if (r) check('total revenue', r.scalar, totalRevenue);

// 2. Revenue by product (group-by sum).
r = ask('total revenue by product');
if (r) {
  const got = {};
  r.rows.forEach(([k, v]) => { got[k] = v; });
  check('revenue by product', got, byProduct);
  check('revenue by product chart type', r.chart && r.chart.type, 'bar');
}

// 3. Top 3 products by revenue.
r = ask('top 3 products by revenue');
if (r) {
  check('top 3 products by revenue', r.rows, top3);
}

// 4. Average quantity.
r = ask('What is the average quantity?');
if (r) check('average quantity', r.scalar, avgQuantity);

// 5. Count of rows.
r = ask('How many rows are there?');
if (r) check('count of rows', r.scalar, rows.length);

// 6. Revenue in October (month filter + implied sum).
r = ask('Revenue in October');
if (r) check('revenue in October', r.scalar, octRevenue);

// 7. Filter by a categorical value.
r = ask('show sales where weather was foggy');
if (r) check('foggy rows count', r.rows.length, foggyRows.length);

// 8. Maximum revenue in a single row.
r = ask('What is the maximum revenue?');
if (r) check('maximum revenue', r.scalar, maxRevenue);

// 9. Minimum quantity.
r = ask('minimum quantity');
if (r) check('minimum quantity', r.scalar, minQty);

// 10. Synonym matching: "sales" means Revenue, "items" means Quantity.
r = ask('total sales');
if (r) check('total sales (synonym for revenue)', r.scalar, totalRevenue);
r = ask('average items');
if (r) check('average items (synonym for quantity)', r.scalar, avgQuantity);

// 11. Group by month produces a line chart.
r = ask('revenue by month');
if (r) {
  check('revenue by month chart type', r.chart && r.chart.type, 'line');
  check('revenue by month groups', r.rows.length, 2);
}

// 12. Unanswerable question fails gracefully with examples.
const bad = qe.answerQuestion(rows, columns, 'what is the meaning of life?');
check('gibberish question returns ok=false', bad.ok, false);
check('gibberish question offers examples', bad.examples.length > 0, true);

// 13. Show all describes the dataset.
r = ask('show all');
if (r) check('show all row count', r.scalar, rows.length);

console.log('\n' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total.');
process.exit(failed ? 1 : 0);
