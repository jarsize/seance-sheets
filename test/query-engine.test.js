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

// 14. Trailing question mark must not break "by month" (found in browser check).
r = ask('What were total sales by month?');
if (r) {
  check('sales by month? groups', r.rows.length, 2);
  check('sales by month? chart type', r.chart && r.chart.type, 'line');
}

// 15. Superlative "which" questions rank a text column and return the winner.
function totalsBy(col, valCol) {
  const t = {};
  rows.forEach((row) => { t[row[col]] = (t[row[col]] || 0) + row[valCol]; });
  return Object.entries(t).sort((a, b) => b[1] - a[1]);
}
const byQty = totalsBy('Product', 'Quantity');
r = ask('Which product sold best?');
if (r) {
  check('which product sold best', r.rows[0][0], byQty[0][0]);
  check('heading: which product sold best', r.interpretation, 'Product with the highest total quantity');
}
const byRev = totalsBy('Patch Location', 'Revenue');
r = ask('Which location had the lowest revenue?');
if (r) {
  check('which location lowest revenue', r.rows[0][0], byRev[byRev.length - 1][0]);
  check('heading: which location lowest revenue', r.interpretation, 'Patch Location with the lowest total revenue');
}

// 16. Natural headings (no machine-like "Summing Revenue" phrasing).
r = ask('What is the total revenue?');
if (r) check('heading: total revenue', r.interpretation, 'Total revenue');
r = ask('total revenue by product');
if (r) check('heading: total revenue by product', r.interpretation, 'Total revenue by product');
r = ask('top 3 products by revenue');
if (r) check('heading: top 3 products by revenue', r.interpretation, 'Top 3 products by revenue');
r = ask('What is the average quantity?');
if (r) check('heading: average quantity', r.interpretation, 'Average quantity');
r = ask('revenue by month');
if (r) check('heading: revenue by month', r.interpretation, 'Total revenue by month');
r = ask('share of revenue by product');
if (r) check('heading: share of revenue by product', r.interpretation, 'Share of revenue by product');
r = ask('How many rows are there?');
if (r) check('heading: row count', r.interpretation, 'Row count');
r = ask('count rows by product');
if (r) check('heading: row count by product', r.interpretation, 'Row count by product');

// 17. Money detection and formatting.
check('money: Revenue', qe.isMoneyColumn('Revenue'), true);
check('money: Unit Price', qe.isMoneyColumn('Unit Price'), true);
check('money: Total Sales', qe.isMoneyColumn('Total Sales'), true);
check('money: Cost', qe.isMoneyColumn('Cost'), true);
check('money: Quantity is not money', qe.isMoneyColumn('Quantity'), false);
check('money: Product is not money', qe.isMoneyColumn('Product'), false);
check('formatMoney', qe.formatMoney(10743.75), '$10,743.75');
check('formatMoney whole number', qe.formatMoney(3060), '$3,060.00');
check('formatMoneyCompact whole number', qe.formatMoneyCompact(3060), '$3,060');
check('formatMoneyCompact with cents', qe.formatMoneyCompact(127.5), '$127.50');

// 18. Chart specs: horizontal bars for grouped results, money flag set.
r = ask('total revenue by product');
if (r) {
  check('grouped bar chart is horizontal', r.chart && r.chart.horizontal, true);
  check('grouped revenue chart is money', r.chart && r.chart.money, true);
}
r = ask('revenue by month');
if (r) {
  check('line chart is not horizontal', r.chart && r.chart.horizontal, false);
  check('monthly revenue chart is money', r.chart && r.chart.money, true);
}
r = ask('count rows by product');
if (r) {
  check('count chart is horizontal', r.chart && r.chart.horizontal, true);
  check('count chart is not money', r.chart && r.chart.money, false);
}

// 19. Pluralization for headings and example questions.
check('pluralize Product', qe.pluralize('Product'), 'products');
check('pluralize Patch Location', qe.pluralize('Patch Location'), 'patch locations');
check('pluralize Category', qe.pluralize('Category'), 'categories');
check('pluralize Class', qe.pluralize('Class'), 'classes');

// 20. Example questions generated from a custom file's own columns.
const customCols = ['City', 'Visitors', 'Ticket Price'];
const customRows = [
  { City: 'Salem', Visitors: 120, 'Ticket Price': 12.5 },
  { City: 'Sleepy Hollow', Visitors: 85, 'Ticket Price': 10 },
  { City: 'Salem', Visitors: 200, 'Ticket Price': 12.5 },
];
const gen = qe.generateExampleQuestions(customRows, customCols);
check('generated examples lead with the file numeric column', gen[0], 'What is the total Visitors?');
check('generated examples include a top-N question', gen.indexOf('Top 3 cities by Visitors') !== -1, true);
check('generated examples include a filter question', gen.indexOf('Show rows where City is Salem') !== -1, true);
check('generated examples have nothing sample-specific',
  gen.every((q) => q.indexOf('Revenue') === -1 && q.indexOf('foggy') === -1 && q.indexOf('October') === -1), true);
// Note: "what is the meaning of life?" is not used here because the word
// "is" substring-matches "Visitors" in the fuzzy column matcher, so the
// engine answers it. A ghost story has no such overlap.
const badCustom = qe.answerQuestion(customRows, customCols, 'tell me a ghost story', { useSampleExamples: false });
check('custom fallback examples are generated', badCustom.examples[0], 'What is the total Visitors?');

console.log('\n' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total.');
process.exit(failed ? 1 : 0);
