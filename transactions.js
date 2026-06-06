// ============================================================
//  YourSay — transactions.js  (runs only on transactions.html)
//  Step 4: Live search + combo filter + CSV export + pagination
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── DATA ─────────────────────────────────────────────────────
  // All transactions stored as an array of objects.
  // Later when Django is ready, this comes from the database.
  // For now we define it here so search/filter/CSV all work.

  const transactions = [
    { num:'001', name:'Government Allocation — Q3',          sub:'Ministry of Finance · Jun 1, 2026',   type:'credit', category:'Government', status:'received',   amount:'+₹12,00,000', icon:'📥' },
    { num:'002', name:'Medical Camp — Nalgonda District',    sub:'Issue #87 · May 28, 2026',            type:'debit',  category:'Healthcare',  status:'completed',  amount:'−₹2,40,000',  icon:'🏥' },
    { num:'003', name:'School Roof Repair — Warangal',       sub:'Issue #91 · May 25, 2026',            type:'debit',  category:'Education',   status:'progress',   amount:'−₹1,80,000',  icon:'🏫' },
    { num:'004', name:'Public Donation Drive — May',         sub:'847 contributors · May 20, 2026',     type:'credit', category:'Donation',    status:'received',   amount:'+₹4,35,000',  icon:'📥' },
    { num:'005', name:'Drinking Water Pipeline — Karimnagar',sub:'Issue #74 · May 15, 2026',            type:'debit',  category:'Infrastructure',status:'completed', amount:'−₹5,20,000',  icon:'🚰' },
    { num:'006', name:'Solar Street Lights — Secunderabad',  sub:'Issue #102 · May 10, 2026',           type:'debit',  category:'Infrastructure',status:'voting',    amount:'−₹3,10,000',  icon:'💡' },
    { num:'007', name:'Road Repair — Kukatpally',            sub:'Issue #98 · May 5, 2026',             type:'debit',  category:'Infrastructure',status:'completed',  amount:'−₹4,80,000',  icon:'🛣️' },
    { num:'008', name:'CSR Contribution — TechCorp Hyderabad',sub:'Corporate · Apr 28, 2026',           type:'credit', category:'Corporate',   status:'received',   amount:'+₹8,00,000',  icon:'📥' },
    { num:'009', name:'Flood Relief Fund — Khammam',         sub:'Issue #112 · Apr 20, 2026',           type:'debit',  category:'Disaster Relief',status:'progress', amount:'−₹3,40,000',  icon:'🌊' },
    { num:'010', name:'Government Allocation — Q2',          sub:'Ministry of Finance · Apr 1, 2026',   type:'credit', category:'Government',  status:'received',   amount:'+₹10,00,000', icon:'📥' },
    { num:'011', name:'Ambulance — Adilabad Tribal Area',    sub:'Issue #87 · Mar 28, 2026',            type:'debit',  category:'Healthcare',  status:'completed',  amount:'−₹6,00,000',  icon:'🚑' },
    { num:'012', name:'School Toilets — Nizamabad',          sub:'Issue #115 · Mar 15, 2026',           type:'debit',  category:'Education',   status:'voting',     amount:'−₹3,50,000',  icon:'🏫' },
  ];

  // ── CURRENT FILTERED LIST ─────────────────────────────────────
  // We keep a copy of the filtered results so CSV exports
  // only the rows the user is currently looking at.
  let filtered = [...transactions];

  // ── PAGINATION ───────────────────────────────────────────────
  const ROWS_PER_PAGE = 8;
  let currentPage = 1;


  // ── GET FILTER VALUES ─────────────────────────────────────────
  const searchInput  = document.querySelector('.search-wrap input');
  const typeSelect   = document.querySelectorAll('.filter-select')[0];
  const statusSelect = document.querySelectorAll('.filter-select')[1];
  const catSelect    = document.querySelectorAll('.filter-select')[2];

  function getFilters() {
    return {
      search: searchInput  ? searchInput.value.trim().toLowerCase() : '',
      type:   typeSelect   ? typeSelect.value   : 'All Types',
      status: statusSelect ? statusSelect.value : 'All Status',
      cat:    catSelect    ? catSelect.value     : 'All Categories',
    };
  }


  // ── FILTER LOGIC ─────────────────────────────────────────────
  // Runs every time any filter changes.
  // Goes through every transaction and keeps only matching ones.

  function applyFilters() {
    const f = getFilters();

    filtered = transactions.filter(tx => {

      // Search — checks name and sub text
      const matchSearch = !f.search ||
        tx.name.toLowerCase().includes(f.search) ||
        tx.sub.toLowerCase().includes(f.search)  ||
        tx.category.toLowerCase().includes(f.search);

      // Type filter
      const matchType =
        f.type === 'All Types'   ||
        (f.type === 'Credit (In)' && tx.type === 'credit') ||
        (f.type === 'Debit (Out)' && tx.type === 'debit');

      // Status filter
      const matchStatus =
        f.status === 'All Status'   ||
        (f.status === 'Completed'   && tx.status === 'completed') ||
        (f.status === 'In Progress' && tx.status === 'progress')  ||
        (f.status === 'Voting'      && tx.status === 'voting')    ||
        (f.status === 'Received'    && tx.status === 'received');

      // Category filter
      const matchCat =
        f.cat === 'All Categories' ||
        tx.category === f.cat;

      return matchSearch && matchType && matchStatus && matchCat;
    });

    currentPage = 1; // reset to page 1 when filter changes
    renderTable();
    renderPagination();
  }


  // ── RENDER TABLE ─────────────────────────────────────────────
  // Clears the table body and redraws with the filtered + paged data.

  function renderTable() {
    const tbody = document.querySelector('.tx-table');
    if (!tbody) return;

    // Remove all rows except the header
    const header = tbody.querySelector('.tx-head');
    tbody.innerHTML = '';
    if (header) tbody.appendChild(header);

    // Slice the filtered array for the current page
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end   = start + ROWS_PER_PAGE;
    const pageData = filtered.slice(start, end);

    // If nothing matches, show a "no results" message
    if (pageData.length === 0) {
      const msg = document.createElement('div');
      msg.style.cssText = 'padding:32px;text-align:center;color:var(--muted);font-size:.9rem;';
      msg.textContent   = 'No transactions match your search.';
      tbody.appendChild(msg);
      return;
    }

    // Build a row for each transaction
    pageData.forEach(tx => {
      const row = document.createElement('div');
      row.className = 'tx-row';

      // Status badge
      const statusMap = {
        received:  { cls:'s-done', label:'✓ Received'    },
        completed: { cls:'s-done', label:'✓ Completed'   },
        progress:  { cls:'s-prog', label:'⏳ In Progress' },
        voting:    { cls:'s-vote', label:'🗳 Voting'       },
      };
      const st = statusMap[tx.status] || { cls:'s-vote', label:tx.status };

      row.innerHTML = `
        <div class="tx-num">${tx.num}</div>
        <div class="tx-left">
          <div class="tx-ico ${tx.type === 'credit' ? 'in' : 'out'}">${tx.icon}</div>
          <div>
            <div class="tx-name">${tx.name}</div>
            <div class="tx-sub">${tx.sub}</div>
          </div>
        </div>
        <div><span class="tx-cat">${tx.category}</span></div>
        <div><span class="tx-status ${st.cls}">${st.label}</span></div>
        <div>
          <div class="tx-amt ${tx.type === 'credit' ? 'cr' : 'dr'}">${tx.amount}</div>
        </div>
      `;
      tbody.appendChild(row);
    });

    // Update the "Showing X–Y of Z" info text
    const pgInfo = document.querySelector('.pg-info');
    if (pgInfo) {
      const from  = filtered.length === 0 ? 0 : start + 1;
      const to    = Math.min(end, filtered.length);
      pgInfo.textContent = `Showing ${from}–${to} of ${filtered.length} transactions`;
    }
  }


  // ── RENDER PAGINATION ─────────────────────────────────────────
  // Builds page number buttons based on total filtered results.

  function renderPagination() {
    const pgBtns = document.querySelector('.pg-btns');
    if (!pgBtns) return;

    const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
    pgBtns.innerHTML = '';

    // Previous button
    const prev = makePageBtn('‹', currentPage === 1);
    prev.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); }
    });
    pgBtns.appendChild(prev);

    // Page number buttons (show max 5)
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      const btn = makePageBtn(String(i), false, i === currentPage);
      btn.addEventListener('click', () => {
        currentPage = i;
        renderTable();
        renderPagination();
        document.querySelector('.tx-table')?.scrollIntoView({ behavior:'smooth', block:'start' });
      });
      pgBtns.appendChild(btn);
    }

    // Next button
    const next = makePageBtn('›', currentPage === totalPages || totalPages === 0);
    next.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderTable(); renderPagination(); }
    });
    pgBtns.appendChild(next);
  }

  // Helper: create a single page button
  function makePageBtn(label, disabled = false, active = false) {
    const btn = document.createElement('button');
    btn.className = 'pg-btn' + (active ? ' active' : '') + (disabled ? ' disabled' : '');
    btn.textContent = label;
    btn.disabled    = disabled;
    return btn;
  }


  // ── CSV EXPORT ───────────────────────────────────────────────
  // Converts the currently FILTERED transactions to a CSV file
  // and downloads it. No library needed — pure JavaScript.
  //
  // How it works:
  // 1. Build a string of comma-separated values
  // 2. Wrap it in a Blob (like a fake file in memory)
  // 3. Create a temporary download link and click it
  // 4. Remove the link

  const exportBtn = document.querySelector('.export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {

      if (filtered.length === 0) {
        showToast('Nothing to export — no matching transactions.', 'warning');
        return;
      }

      // CSV header row
      const headers = ['#', 'Description', 'Date', 'Category', 'Status', 'Amount'];

      // Build rows from filtered data
      const rows = filtered.map(tx => [
        tx.num,
        `"${tx.name}"`,                       // quotes around text with commas
        `"${tx.sub}"`,
        tx.category,
        tx.status,
        tx.amount.replace('₹','Rs. '),        // ₹ symbol can break some Excel
      ]);

      // Join everything into one CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      // Create a downloadable file from the string
      const blob     = new Blob([csvContent], { type:'text/csv;charset=utf-8;' });
      const url      = URL.createObjectURL(blob);
      const link     = document.createElement('a');
      link.href      = url;
      link.download  = `YourSay-transactions-${Date.now()}.csv`;

      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // clean up memory

      showToast(`Exported ${filtered.length} transactions as CSV ✓`, 'success');
    });
  }


  // ── ATTACH EVENT LISTENERS ───────────────────────────────────
  // Connect every filter input to applyFilters()
  // so the table updates live as you type or select.

  if (searchInput)  searchInput.addEventListener('input',  applyFilters);
  if (typeSelect)   typeSelect.addEventListener('change',  applyFilters);
  if (statusSelect) statusSelect.addEventListener('change',applyFilters);
  if (catSelect)    catSelect.addEventListener('change',   applyFilters);


  // ── INITIAL RENDER ───────────────────────────────────────────
  // Draw the table when the page first loads.
  applyFilters();


}); // end DOMContentLoaded
