const TX_API = 'https://yoursay-backend-g6ri.onrender.com/api/transactions/';

document.addEventListener('DOMContentLoaded', () => {

  let allTransactions = []; 
  let filtered = [];        
  let currentPage = 1;
  const ROWS_PER_PAGE = 8;

  function loadTransactions() {
    const table = document.querySelector('.tx-table');
    if (!table) return;

    fetch(TX_API)
      .then(res => res.json())
      .then(data => {
        allTransactions = data.transactions;
        filtered        = [...allTransactions];
        renderTable();
        renderPagination();
        updateMiniStats();
      })
      .catch(() => {
        showToast('Could not load transactions. Is backend running?', 'error');
      });
  }

  function updateMiniStats() {
    const thisMonth = new Date().toLocaleString('en-IN',
      { month: 'long', year: 'numeric' });

    let monthIn  = 0;
    let monthOut = 0;

    allTransactions.forEach(tx => {
      if (tx.type === 'credit') monthIn  += tx.amount;
      else                       monthOut += tx.amount;
    });

    const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

    const stats = document.querySelectorAll('.ms-val');
    if (stats[0]) stats[0].textContent = '+' + fmt(monthIn);
    if (stats[1]) stats[1].textContent = '−' + fmt(monthOut);
    if (stats[2]) stats[2].textContent = allTransactions.length;
  }

  function applyFilters() {
    const searchInput  = document.querySelector('.search-wrap input');
    const typeSelect   = document.querySelectorAll('.filter-select')[0];
    const statusSelect = document.querySelectorAll('.filter-select')[1];
    const catSelect    = document.querySelectorAll('.filter-select')[2];

    const search = searchInput  ? searchInput.value.trim().toLowerCase() : '';
    const type   = typeSelect   ? typeSelect.value   : 'All Types';
    const status = statusSelect ? statusSelect.value : 'All Status';
    const cat    = catSelect    ? catSelect.value    : 'All Categories';

    filtered = allTransactions.filter(tx => {

      const matchSearch = !search ||
        tx.name.toLowerCase().includes(search)        ||
        tx.description.toLowerCase().includes(search) ||
        tx.category.toLowerCase().includes(search);

      const matchType =
        type === 'All Types'    ||
        (type === 'Credit (In)' && tx.type === 'credit') ||
        (type === 'Debit (Out)' && tx.type === 'debit');

      const matchStatus =
        status === 'All Status'   ||
        (status === 'Completed'   && tx.status === 'completed') ||
        (status === 'In Progress' && tx.status === 'progress')  ||
        (status === 'Voting'      && tx.status === 'voting')    ||
        (status === 'Received'    && tx.status === 'received');

      const matchCat =
        cat === 'All Categories' ||
        tx.category === cat;

      return matchSearch && matchType && matchStatus && matchCat;
    });

    currentPage = 1;
    renderTable();
    renderPagination();
  }

  function renderTable() {
    const tbody = document.querySelector('.tx-table');
    if (!tbody) return;

    const header = tbody.querySelector('.tx-head');
    tbody.innerHTML = '';
    if (header) tbody.appendChild(header);

    const start    = (currentPage - 1) * ROWS_PER_PAGE;
    const pageData = filtered.slice(start, start + ROWS_PER_PAGE);

    if (pageData.length === 0) {
      const msg = document.createElement('div');
      msg.style.cssText = 'padding:32px;text-align:center;color:var(--muted);font-size:.9rem;';
      msg.textContent   = 'No transactions match your search.';
      tbody.appendChild(msg);
      updatePgInfo(0, 0);
      return;
    }

    const statusMap = {
      received:  { cls:'s-done', label:'✓ Received'    },
      completed: { cls:'s-done', label:'✓ Completed'   },
      progress:  { cls:'s-prog', label:'⏳ In Progress' },
      voting:    { cls:'s-vote', label:'🗳 Voting'       },
    };

    pageData.forEach((tx, i) => {
      const num = String(start + i + 1).padStart(3, '0');
      const st  = statusMap[tx.status] || { cls:'s-vote', label: tx.status_label };
      const amt = '₹' + Math.abs(tx.amount).toLocaleString('en-IN');

      const row = document.createElement('div');
      row.className = 'tx-row';
      row.innerHTML = `
        <div class="tx-num">${num}</div>
        <div class="tx-left">
          <div class="tx-ico ${tx.type === 'credit' ? 'in' : 'out'}">${tx.icon}</div>
          <div>
            <div class="tx-name">${tx.name}</div>
            <div class="tx-sub">${tx.description || tx.date}</div>
          </div>
        </div>
        <div><span class="tx-cat">${tx.category}</span></div>
        <div><span class="tx-status ${st.cls}">${st.label}</span></div>
        <div>
          <div class="tx-amt ${tx.type === 'credit' ? 'cr' : 'dr'}">
            ${tx.type === 'credit' ? '+' : '−'}${amt}
          </div>
          <div class="tx-date-cell">${tx.date}</div>
        </div>
      `;
      tbody.appendChild(row);
    });

    updatePgInfo(start + 1, Math.min(start + ROWS_PER_PAGE, filtered.length));
  }

  function updatePgInfo(from, to) {
    const pgInfo = document.querySelector('.pg-info');
    if (pgInfo) pgInfo.textContent =
      `Showing ${from}–${to} of ${filtered.length} transactions`;
  }

  function renderPagination() {
    const pgBtns   = document.querySelector('.pg-btns');
    if (!pgBtns) return;
    const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
    pgBtns.innerHTML = '';

    const prev = makeBtn('‹', currentPage === 1);
    prev.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); }
    });
    pgBtns.appendChild(prev);

    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
      const btn = makeBtn(String(i), false, i === currentPage);
      btn.addEventListener('click', () => {
        currentPage = i; renderTable(); renderPagination();
        document.querySelector('.tx-table')
          ?.scrollIntoView({ behavior:'smooth', block:'start' });
      });
      pgBtns.appendChild(btn);
    }

    const next = makeBtn('›', currentPage >= totalPages || totalPages === 0);
    next.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderTable(); renderPagination(); }
    });
    pgBtns.appendChild(next);
  }

  function makeBtn(label, disabled=false, active=false) {
    const btn = document.createElement('button');
    btn.className   = 'pg-btn' + (active?' active':'') + (disabled?' disabled':'');
    btn.textContent = label;
    btn.disabled    = disabled;
    return btn;
  }

  const exportBtn = document.querySelector('.export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (filtered.length === 0) {
        showToast('Nothing to export.', 'warning');
        return;
      }
      const headers = ['#','Name','Description','Date','Category','Status','Amount'];
      const rows    = filtered.map((tx, i) => [
        i + 1,
        `"${tx.name}"`,
        `"${tx.description}"`,
        tx.date,
        tx.category,
        tx.status_label,
        `"${tx.type === 'credit' ? '+' : '-'}Rs. ${tx.amount}"`,
      ]);
      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `yoursay-transactions-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${filtered.length} transactions ✓`, 'success');
    });
  }

  const searchInput  = document.querySelector('.search-wrap input');
  const typeSelect   = document.querySelectorAll('.filter-select')[0];
  const statusSelect = document.querySelectorAll('.filter-select')[1];
  const catSelect    = document.querySelectorAll('.filter-select')[2];

  if (searchInput)  searchInput.addEventListener('input',  applyFilters);
  if (typeSelect)   typeSelect.addEventListener('change',  applyFilters);
  if (statusSelect) statusSelect.addEventListener('change',applyFilters);
  if (catSelect)    catSelect.addEventListener('change',   applyFilters);

  loadTransactions();

});