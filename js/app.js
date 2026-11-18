// Séance Sheets app logic: file loading, preview, asking, and rendering.
// Runs entirely in the browser. The query engine lives in js/query-engine.js.

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const dropzone = $('dropzone');
  const fileInput = $('file-input');
  const loadStatus = $('load-status');
  const preview = $('preview');
  const previewMeta = $('preview-meta');
  const previewTable = $('preview-table');
  const questionInput = $('question-input');
  const askButton = $('ask-button');
  const chipsBox = $('example-chips');
  const resultsPanel = $('results-panel');
  const interpretationEl = $('interpretation');
  const resultsTable = $('results-table');
  const resultsTableWrap = $('results-table-wrap');
  const chartWrap = $('chart-wrap');
  const noDataNote = $('no-data-note');
  const helpPanel = $('help-panel');
  const helpMessage = $('help-message');
  const helpList = $('help-list');

  let columns = [];
  let rows = [];
  let chart = null;
  let datasetName = '';

  const CHART_COLORS = [
    '#7cffb2', '#a78bfa', '#ff8c1a', '#38bdf8', '#f472b6',
    '#facc15', '#34d399', '#c084fc', '#fb923c', '#60a5fa',
  ];

  function setStatus(message, kind) {
    loadStatus.textContent = message;
    loadStatus.className = 'status-line' + (kind ? ' ' + kind : '');
  }

  function formatValue(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') {
      if (!isFinite(v)) return String(v);
      return Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return String(v);
  }

  function setData(newColumns, newRows, name) {
    columns = newColumns;
    rows = newRows;
    datasetName = name;
    questionInput.disabled = false;
    askButton.disabled = false;
    chipsBox.querySelectorAll('.chip').forEach((c) => { c.disabled = false; });
    setStatus('Loaded ' + rows.length.toLocaleString('en-US') + ' rows from ' + name + '.', 'success');
    renderPreview();
    resultsPanel.classList.add('hidden');
    helpPanel.classList.add('hidden');
  }

  function renderPreview() {
    previewMeta.innerHTML = '<strong>' + rows.length.toLocaleString('en-US') + ' rows</strong> and ' +
      columns.length + ' columns: ' + columns.map(escapeHtml).join(', ') + '. Showing the first 5 rows.';
    const head = '<thead><tr>' + columns.map((c) => '<th>' + escapeHtml(c) + '</th>').join('') + '</tr></thead>';
    const body = '<tbody>' + rows.slice(0, 5).map((r) =>
      '<tr>' + columns.map((c) => '<td>' + escapeHtml(formatValue(r[c])) + '</td>').join('') + '</tr>'
    ).join('') + '</tbody>';
    previewTable.innerHTML = head + body;
    preview.classList.remove('hidden');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Normalize parsed rows: trim string values, coerce numeric-looking
  // strings to numbers, and drop fully empty rows.
  function cleanRows(rawRows, rawColumns) {
    const cols = rawColumns.map((c) => String(c).trim()).filter((c) => c !== '');
    const out = [];
    rawRows.forEach((r) => {
      const obj = {};
      let hasValue = false;
      cols.forEach((c) => {
        let v = r[c];
        if (v === undefined || v === null) v = '';
        if (typeof v === 'string') v = v.trim();
        if (v !== '') {
          hasValue = true;
          if (typeof v === 'string' && /^-?[\d,]+(\.\d+)?$/.test(v)) v = Number(v.replace(/,/g, ''));
        }
        obj[c] = v;
      });
      if (hasValue) out.push(obj);
    });
    return { columns: cols, rows: out };
  }

  function loadCsvFile(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length) {
          setStatus('Could not parse that CSV file. Check that it has a header row and try again.', 'error');
          return;
        }
        const cleaned = cleanRows(results.data, results.meta.fields || []);
        if (!cleaned.rows.length) {
          setStatus('That CSV file has no data rows.', 'error');
          return;
        }
        setData(cleaned.columns, cleaned.rows, file.name);
      },
      error: () => setStatus('Could not read that CSV file.', 'error'),
    });
  }

  function loadExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const raw = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!raw.length) {
          setStatus('That spreadsheet has no data rows on its first sheet.', 'error');
          return;
        }
        const cleaned = cleanRows(raw, Object.keys(raw[0]));
        setData(cleaned.columns, cleaned.rows, file.name + ' (sheet "' + firstSheet + '")');
      } catch (err) {
        setStatus('Could not parse that Excel file. Make sure it is a valid .xlsx file.', 'error');
      }
    };
    reader.onerror = () => setStatus('Could not read that file.', 'error');
    reader.readAsArrayBuffer(file);
  }

  function handleFile(file) {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) loadCsvFile(file);
    else if (name.endsWith('.xlsx') || name.endsWith('.xls')) loadExcelFile(file);
    else setStatus('That file type is not supported. Please use a .csv or .xlsx file.', 'error');
  }

  function loadSample() {
    setData(SAMPLE_COLUMNS.slice(), SAMPLE_DATA.map((r) => Object.assign({}, r)), 'the sample pumpkin-patch dataset');
    questionInput.focus();
  }

  function ask(question) {
    const q = (question || '').trim();
    if (!q) return;
    questionInput.value = q;
    const result = SeanceQuery.answerQuestion(rows, columns, q);
    if (!result.ok) {
      resultsPanel.classList.add('hidden');
      helpMessage.textContent = result.message;
      helpList.innerHTML = result.examples.map((ex) =>
        '<li><button type="button" data-question="' + escapeHtml(ex) + '">' + escapeHtml(ex) + '</button></li>'
      ).join('');
      helpList.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => ask(b.getAttribute('data-question')));
      });
      helpPanel.classList.remove('hidden');
      helpPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    helpPanel.classList.add('hidden');
    interpretationEl.textContent = result.interpretation;
    const head = '<thead><tr>' + result.headers.map((h) => '<th>' + escapeHtml(h) + '</th>').join('') + '</tr></thead>';
    const body = '<tbody>' + result.rows.map((row) =>
      '<tr>' + row.map((v) => '<td>' + escapeHtml(formatValue(v)) + '</td>').join('') + '</tr>'
    ).join('') + '</tbody>';
    resultsTable.innerHTML = head + body;
    resultsTableWrap.classList.toggle('hidden', !result.rows.length);
    noDataNote.classList.add('hidden');
    if (!result.rows.length) {
      noDataNote.textContent = 'No rows to show for that question.';
      noDataNote.classList.remove('hidden');
    }
    renderChart(result.chart);
    resultsPanel.classList.remove('hidden');
    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderChart(spec) {
    if (chart) { chart.destroy(); chart = null; }
    const grid = document.querySelector('.results-grid');
    if (!spec || !spec.labels || spec.labels.length < 2) {
      chartWrap.classList.add('hidden');
      grid.classList.remove('two-col');
      return;
    }
    chartWrap.classList.remove('hidden');
    grid.classList.add('two-col');
    const colors = spec.labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
    const isDoughnut = spec.type === 'doughnut';
    const dataset = {
      label: spec.label,
      data: spec.values,
      backgroundColor: isDoughnut ? colors : colors[0],
      borderColor: isDoughnut ? '#1d1038' : colors[0],
      borderWidth: isDoughnut ? 2 : 1,
      tension: 0.3,
    };
    chart = new Chart($('results-chart'), {
      type: spec.type,
      data: { labels: spec.labels, datasets: [dataset] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: isDoughnut,
            labels: { color: '#f2ecff' },
          },
        },
        scales: isDoughnut ? {} : {
          x: { ticks: { color: '#b9a8d9' }, grid: { color: 'rgba(185, 168, 217, 0.15)' } },
          y: { ticks: { color: '#b9a8d9' }, grid: { color: 'rgba(185, 168, 217, 0.15)' }, beginAtZero: true },
        },
      },
    });
  }

  // Example question chips.
  SeanceQuery.EXAMPLE_QUESTIONS.forEach((q) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = q;
    chip.disabled = true;
    chip.addEventListener('click', () => ask(q));
    chipsBox.appendChild(chip);
  });

  // Upload wiring.
  dropzone.addEventListener('click', (e) => {
    if (e.target.id === 'browse-button') return;
    fileInput.click();
  });
  $('browse-button').addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  }));
  ['dragleave', 'drop'].forEach((ev) => dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
  }));
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });

  $('sample-button').addEventListener('click', loadSample);
  $('ask-form').addEventListener('submit', (e) => {
    e.preventDefault();
    ask(questionInput.value);
  });
})();
