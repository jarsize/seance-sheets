// Séance Sheets query engine.
// Deterministic natural-language queries over tabular data. No LLM, no API.
// Core functions are plain JavaScript and also run under Node for testing:
//   const qe = require('./js/query-engine.js');
//   qe.answerQuestion(rows, columns, 'total revenue by product')

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SeanceQuery = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Synonyms map question words to column-name hints. Fuzzy matching below
  // also matches question words against actual column names, so this table
  // only covers words that do not appear in the column names themselves.
  const SYNONYMS = {
    sales: 'revenue',
    money: 'revenue',
    earnings: 'revenue',
    income: 'revenue',
    takings: 'revenue',
    items: 'quantity',
    units: 'quantity',
    sold: 'quantity',
    qty: 'quantity',
    amount: 'quantity',
    price: 'unit price',
    cost: 'unit price',
    where: 'patch location',
    location: 'patch location',
    patch: 'patch location',
    place: 'patch location',
    product: 'product',
    weather: 'weather',
    conditions: 'weather',
    date: 'date',
    day: 'date',
    month: 'date',
    when: 'date',
  };

  const MONTHS = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, sept: 9, october: 10, oct: 10,
    november: 11, december: 12,
  };

  const EXAMPLE_QUESTIONS = [
    'What is the total revenue?',
    'Total revenue by product',
    'Top 3 products by revenue',
    'Average quantity by location',
    'How many rows are there?',
    'Show sales where weather was foggy',
    'Revenue in October',
    'Share of revenue by product',
    'Revenue by month',
    'Show all',
  ];

  function normalize(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function words(text) {
    const n = normalize(text);
    return n ? n.split(' ') : [];
  }

  function isNumericValue(v) {
    if (v === null || v === undefined || v === '') return false;
    return !isNaN(Number(String(v).replace(/[$,]/g, '')));
  }

  function toNumber(v) {
    return Number(String(v).replace(/[$,]/g, ''));
  }

  function isDateValue(v) {
    if (v === null || v === undefined || v === '') return false;
    const s = String(v).trim();
    return /^\d{4}-\d{2}-\d{2}/.test(s) || !isNaN(Date.parse(s));
  }

  // Classify each column as numeric, date, or categorical, from its values.
  function analyzeColumns(rows, columns) {
    const info = {};
    columns.forEach((col) => {
      let numeric = 0, date = 0, seen = 0;
      rows.forEach((r) => {
        const v = r[col];
        if (v === null || v === undefined || v === '') return;
        seen++;
        if (isNumericValue(v)) numeric++;
        else if (isDateValue(v)) date++;
      });
      let type = 'categorical';
      if (seen > 0 && numeric / seen >= 0.8) type = 'numeric';
      else if (seen > 0 && date / seen >= 0.8) type = 'date';
      info[col] = { type: type, distinct: distinctValues(rows, col) };
    });
    return info;
  }

  function distinctValues(rows, col) {
    const seen = new Set();
    rows.forEach((r) => {
      const v = r[col];
      if (v !== null && v !== undefined && v !== '') seen.add(String(v));
    });
    return Array.from(seen);
  }

  // Fuzzy column match: score each column by how well the question words
  // (plus synonym expansion) match its name. Returns the best column or null.
  function matchColumn(question, columns, preferType, colInfo) {
    const qWords = words(question);
    const expanded = new Set(qWords);
    qWords.forEach((w) => { if (SYNONYMS[w]) expanded.add(SYNONYMS[w]); });
    let best = null, bestScore = 0;
    columns.forEach((col) => {
      if (preferType && colInfo && colInfo[col] && colInfo[col].type !== preferType) return;
      const cWords = words(col);
      let score = 0;
      cWords.forEach((cw) => {
        expanded.forEach((qw) => {
          if (cw === qw) score += 3;
          else if (cw.indexOf(qw) !== -1 || qw.indexOf(cw) !== -1) score += 1;
        });
      });
      // Full normalized column name appearing in the question is a strong hit.
      if (normalize(question).indexOf(normalize(col)) !== -1) score += 5;
      if (score > bestScore) { bestScore = score; best = col; }
    });
    return bestScore > 0 ? best : null;
  }

  // Find a categorical value mentioned in the question, e.g. "foggy" or
  // "north patch". Returns { column, value } or null.
  function findValueFilter(question, rows, columns, colInfo) {
    const q = normalize(question);
    let best = null;
    columns.forEach((col) => {
      if (colInfo[col].type === 'numeric') return;
      colInfo[col].distinct.forEach((val) => {
        const nv = normalize(val);
        if (nv.length < 3) return;
        if (q.indexOf(nv) !== -1) {
          if (!best || nv.length > normalize(best.value).length) {
            best = { column: col, value: val };
          }
        }
      });
    });
    return best;
  }

  function monthFromQuestion(question) {
    const qWords = words(question);
    for (let i = 0; i < qWords.length; i++) {
      if (MONTHS[qWords[i]]) return MONTHS[qWords[i]];
    }
    return null;
  }

  function monthOf(value) {
    const d = new Date(String(value));
    if (isNaN(d.getTime())) return null;
    return d.getMonth() + 1;
  }

  function monthKey(value) {
    const d = new Date(String(value));
    if (isNaN(d.getTime())) return String(value);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function aggregate(values, op) {
    if (!values.length) return null;
    if (op === 'sum') return values.reduce((a, b) => a + b, 0);
    if (op === 'avg') return values.reduce((a, b) => a + b, 0) / values.length;
    if (op === 'min') return Math.min.apply(null, values);
    if (op === 'max') return Math.max.apply(null, values);
    if (op === 'count') return values.length;
    return null;
  }

  function groupRows(rows, groupCol, valueCol, op, dateGranularity) {
    const groups = {};
    const order = [];
    rows.forEach((r) => {
      let key = r[groupCol];
      if (dateGranularity === 'month') key = monthKey(r[groupCol]);
      if (key === null || key === undefined || key === '') key = '(blank)';
      key = String(key);
      if (!groups[key]) { groups[key] = []; order.push(key); }
      if (valueCol) {
        const v = r[valueCol];
        if (isNumericValue(v)) groups[key].push(toNumber(v));
      } else {
        groups[key].push(1);
      }
    });
    const result = order.map((key) => ({
      key: key,
      value: op === 'count' && !valueCol ? groups[key].length : aggregate(groups[key], op),
    }));
    return result;
  }

  function fail(message) {
    return {
      ok: false,
      message: message,
      examples: EXAMPLE_QUESTIONS.slice(),
      interpretation: null,
      headers: [],
      rows: [],
      chart: null,
      scalar: null,
    };
  }

  function okResult(interpretation, headers, rows, chart, scalar) {
    return {
      ok: true,
      message: null,
      examples: [],
      interpretation: interpretation,
      headers: headers,
      rows: rows,
      chart: chart || null,
      scalar: scalar === undefined ? null : scalar,
    };
  }

  function opLabel(op) {
    return { sum: 'Total', avg: 'Average', min: 'Minimum', max: 'Maximum', count: 'Count' }[op] || op;
  }

  function opVerb(op) {
    return { sum: 'Summing', avg: 'Averaging', min: 'Finding the minimum of', max: 'Finding the maximum of', count: 'Counting' }[op] || op;
  }

  // Main entry point. rows: array of objects keyed by column name.
  function answerQuestion(rows, columns, question) {
    if (!rows || !rows.length) {
      return fail('No data is loaded yet. Upload a CSV or Excel file, or load the sample data, then ask away.');
    }
    if (!question || !question.trim()) {
      return fail('Ask me something about your data. Here are some questions I understand:');
    }
    const q = question.trim();
    const qLower = q.toLowerCase();
    const colInfo = analyzeColumns(rows, columns);
    const numericCols = columns.filter((c) => colInfo[c].type === 'numeric');
    const dateCols = columns.filter((c) => colInfo[c].type === 'date');

    // "Show all" / describe the dataset.
    if (/\b(show all|show everything|show me everything|show me all|describe|summary|overview|what columns|what is in (this|the) data)\b/.test(qLower)) {
      const headers = ['Column', 'Type', 'Distinct values'];
      const table = columns.map((c) => [c, colInfo[c].type, String(colInfo[c].distinct.length)]);
      const preview = rows.slice(0, 10).map((r) => columns.map((c) => r[c]));
      return okResult(
        'Describing the dataset (' + rows.length + ' rows, ' + columns.length + ' columns)',
        headers, table, null, rows.length
      );
    }

    // Detect the aggregate operation.
    let op = null;
    if (/\b(total|sum|add up|altogether)\b/.test(qLower)) op = 'sum';
    else if (/\b(average|avg|mean)\b/.test(qLower)) op = 'avg';
    else if (/\b(minimum|min|lowest|smallest|cheapest)\b/.test(qLower)) op = 'min';
    else if (/\b(maximum|max|highest|largest|biggest|most expensive)\b/.test(qLower)) op = 'max';
    else if (/\b(count|how many)\b/.test(qLower)) op = 'count';

    // Detect top-N.
    let topN = null;
    const topMatch = qLower.match(/\btop\s+(\d+)\b/);
    if (topMatch) topN = parseInt(topMatch[1], 10);

    const shareQuestion = /\b(share|percentage|percent|proportion|breakdown)\b/.test(qLower);

    // Detect a group-by clause: "by <word>" or "per <word>".
    let groupCol = null;
    let dateGranularity = null;
    // "top 3 products by revenue": the group column is the word after "top N",
    // and "by revenue" names the value column, so check the top phrase first.
    if (topN) {
      const topPhrase = qLower.match(/\btop\s+\d+\s+([a-z][a-z\s]*?)\s+by\b/);
      if (topPhrase) groupCol = matchColumn(topPhrase[1].trim(), columns, null, colInfo);
    }
    const byMatch = qLower.match(/\b(?:by|per)\s+([a-z][a-z\s]*?)(?:\s+(?:in|for|where|with|and)\b|$)/);
    if (!groupCol && byMatch) {
      const byPhrase = byMatch[1].trim();
      if (/\b(month|monthly)\b/.test(byPhrase) && dateCols.length) {
        groupCol = dateCols[0];
        dateGranularity = 'month';
      } else if (/\b(date|day|daily)\b/.test(byPhrase) && dateCols.length) {
        groupCol = dateCols[0];
      } else {
        groupCol = matchColumn(byPhrase, columns, null, colInfo);
      }
    }

    // Detect filters: a month name, or a categorical value named in the question.
    const month = monthFromQuestion(q);
    const valueFilter = findValueFilter(q, rows, columns, colInfo);
    let filtered = rows;
    const filterDesc = [];
    if (month && dateCols.length) {
      filtered = filtered.filter((r) => monthOf(r[dateCols[0]]) === month);
      const monthName = Object.keys(MONTHS).find((k) => MONTHS[k] === month);
      filterDesc.push('in ' + monthName.charAt(0).toUpperCase() + monthName.slice(1));
    }
    if (valueFilter) {
      filtered = filtered.filter((r) => String(r[valueFilter.column]) === valueFilter.value);
      filterDesc.push('where ' + valueFilter.column + ' is "' + valueFilter.value + '"');
    }
    // Numeric comparison: "revenue over 100", "quantity less than 5".
    const cmpMatch = qLower.match(/\b(over|above|more than|greater than|under|below|less than)\s+\$?([\d,]+(?:\.\d+)?)/);
    if (cmpMatch) {
      const cmpCol = matchColumn(q, columns, 'numeric', colInfo);
      if (cmpCol) {
        const threshold = parseFloat(cmpMatch[2].replace(/,/g, ''));
        const isOver = ['over', 'above', 'more than', 'greater than'].indexOf(cmpMatch[1]) !== -1;
        filtered = filtered.filter((r) => {
          if (!isNumericValue(r[cmpCol])) return false;
          return isOver ? toNumber(r[cmpCol]) > threshold : toNumber(r[cmpCol]) < threshold;
        });
        filterDesc.push('where ' + cmpCol + ' is ' + (isOver ? 'over ' : 'under ') + threshold);
      }
    }

    const filterSuffix = filterDesc.length ? ' (' + filterDesc.join(', ') + ')' : '';

    // Plain filter / list request with no aggregate: "show sales where ...".
    if (!op && !topN && !shareQuestion && (valueFilter || month || cmpMatch || /\b(show|list|find|display)\b/.test(qLower))) {
      if (!filtered.length) {
        return okResult('No rows match' + filterSuffix, columns, [], null, 0);
      }
      const table = filtered.slice(0, 100).map((r) => columns.map((c) => r[c]));
      return okResult(
        'Showing ' + filtered.length + ' matching row' + (filtered.length === 1 ? '' : 's') + filterSuffix,
        columns, table, null, filtered.length
      );
    }

    // Count of rows: "how many rows", "count of rows", "how many sales".
    if (op === 'count' && (/\brows?\b/.test(qLower) || /\brecords?\b/.test(qLower) || !matchColumn(q, columns, 'numeric', colInfo))) {
      if (groupCol) {
        const grouped = groupRows(filtered, groupCol, null, 'count');
        const table = grouped.map((g) => [g.key, g.value]);
        return okResult(
          'Counting rows grouped by ' + groupCol + filterSuffix,
          [groupCol, 'Count'], table,
          { type: 'bar', labels: grouped.map((g) => g.key), values: grouped.map((g) => g.value), label: 'Count' },
          null
        );
      }
      return okResult(
        'Counting rows' + filterSuffix,
        ['Count'], [[filtered.length]], null, filtered.length
      );
    }

    // Aggregate over a numeric column (default: sum if a numeric column is
    // named but no operation word is present, e.g. "revenue in October").
    let valueCol = matchColumn(q, columns, 'numeric', colInfo);
    if (!valueCol && op === 'count') {
      valueCol = null;
    }
    if (!valueCol && op) {
      return fail('I could not tell which number column you mean. Try naming one, like Revenue or Quantity.');
    }
    if (!valueCol && !op) {
      return fail('I did not understand that question. Try one of these instead:');
    }
    if (!op) op = 'sum';

    // Grouped aggregate.
    if (groupCol) {
      let grouped = groupRows(filtered, groupCol, valueCol, op, dateGranularity);
      if (topN) {
        grouped = grouped.slice().sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, topN);
      }
      const label = opLabel(op) + ' ' + valueCol;
      const table = grouped.map((g) => [g.key, g.value]);
      let chart = null;
      if (grouped.length > 1) {
        let chartType = 'bar';
        if (dateGranularity === 'month' || colInfo[groupCol].type === 'date') chartType = 'line';
        if (shareQuestion) chartType = 'doughnut';
        chart = {
          type: chartType,
          labels: grouped.map((g) => g.key),
          values: grouped.map((g) => g.value),
          label: label,
        };
      }
      let interp = opVerb(op) + ' ' + valueCol + ' grouped by ' + groupCol;
      if (dateGranularity === 'month') interp += ' (by month)';
      if (topN) interp = 'Top ' + topN + ' ' + groupCol + ' values by ' + opLabel(op).toLowerCase() + ' ' + valueCol;
      if (shareQuestion) interp = 'Share of ' + opLabel(op).toLowerCase() + ' ' + valueCol + ' by ' + groupCol;
      return okResult(interp + filterSuffix, [groupCol, label], table, chart, null);
    }

    // Single-value aggregate.
    const values = [];
    filtered.forEach((r) => { if (isNumericValue(r[valueCol])) values.push(toNumber(r[valueCol])); });
    const result = aggregate(values, op);
    if (result === null) {
      return okResult(opVerb(op) + ' ' + valueCol + filterSuffix + ': no numeric values found',
        [opLabel(op) + ' ' + valueCol], [['(no data)']], null, null);
    }
    return okResult(
      opVerb(op) + ' ' + valueCol + filterSuffix,
      [opLabel(op) + ' ' + valueCol], [[result]], null, result
    );
  }

  return {
    answerQuestion: answerQuestion,
    analyzeColumns: analyzeColumns,
    matchColumn: matchColumn,
    EXAMPLE_QUESTIONS: EXAMPLE_QUESTIONS,
  };
});
