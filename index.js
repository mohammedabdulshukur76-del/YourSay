const STATS_API = 'https://yoursay-backend-g6ri.onrender.com/api/stats/';

document.addEventListener('DOMContentLoaded', () => {
  function loadStats() {
    fetch(STATS_API)
      .then(res => res.json())
      .then(data => {
        updateStatCards(data);
        updateTransactions(data.transactions);
        updateTopIssues(data.top_issues);
        updateBalanceCard(data);
      })
      .catch(() => {
        showToast('Could not load stats. Is backend running?', 'error');
      });
  }

  function updateStatCards(data) {
    const fmt     = n => '₹' + formatLakhs(n);
    const statEls = document.querySelectorAll('.stat-value');

    const values = [
      fmt(data.total_received),
      fmt(data.total_spent),
      fmt(data.balance),
      data.issues_resolved.toString(),
    ];

    statEls.forEach((el, i) => {
      if (values[i] === undefined) return;
      animateValue(el, values[i]);
    });

    const subs = document.querySelectorAll('.stat-sub');
    if (subs[0]) subs[0].textContent = 'Total funds received';
    if (subs[1]) subs[1].textContent = 'Total funds utilized';
    if (subs[2]) subs[2].textContent = 'Available for active issues';
    if (subs[3]) subs[3].textContent = 'With verified proof uploaded';
  }

  function animateValue(el, finalText) {
    const isRupee   = finalText.includes('₹');
    const isLakhs   = finalText.includes('L');
    const numStr    = finalText.replace('₹','').replace('L','').trim();
    const target    = parseFloat(numStr) || 0;

    let frame = 0;
    const steps = 60;

    const interval = setInterval(() => {
      frame++;
      const eased   = 1 - Math.pow(1 - frame / steps, 3);
      const current = target * eased;

      if (isLakhs) {
        el.textContent = (isRupee ? '₹' : '') + current.toFixed(1) + 'L';
      } else {
        el.textContent = Math.floor(current).toLocaleString('en-IN');
      }

      if (frame >= steps) {
        clearInterval(interval);
        el.textContent = finalText;
      }
    }, 16);
  }

  function formatLakhs(amount) {
    const lakhs = amount / 100000;
    return lakhs.toFixed(1) + 'L';
  }

  function updateTransactions(transactions) {
    const table = document.querySelector('.tx-table');
    if (!table || !transactions.length) return;

    const header = table.querySelector('.tx-head');
    table.innerHTML = '';
    if (header) table.appendChild(header);

    const statusMap = {
      received:  { cls:'s-done', label:'✓ Received'    },
      completed: { cls:'s-done', label:'✓ Completed'   },
      progress:  { cls:'s-prog', label:'⏳ In Progress' },
      voting:    { cls:'s-vote', label:'🗳 Voting'       },
    };

    transactions.forEach(tx => {
      const st  = statusMap[tx.status] || { cls:'s-vote', label: tx.status_label };
      const amt = '₹' + Math.abs(tx.amount).toLocaleString('en-IN');

      const row = document.createElement('div');
      row.className = 'tx-row';
      row.innerHTML = `
        <div class="tx-left">
          <div class="tx-ico ${tx.type === 'credit' ? 'in' : 'out'}">${tx.icon}</div>
          <div>
            <div class="tx-name">${tx.name}</div>
            <div class="tx-sub">${tx.description || tx.date}</div>
          </div>
        </div>
        <div><span class="tx-status ${st.cls}">${st.label}</span></div>
        <div>
          <div class="tx-amt ${tx.type === 'credit' ? 'cr' : 'dr'}">
            ${tx.type === 'credit' ? '+' : '−'}${amt}
          </div>
          <div class="tx-date-cell">${tx.date}</div>
        </div>
      `;
      table.appendChild(row);
    });
  }

  function updateTopIssues(issues) {
    const issuesCard = document.querySelector('.issues-card');
    if (!issuesCard || !issues.length) return;

    issuesCard.querySelectorAll('.issue-row').forEach(r => r.remove());

    const pillMap = {
      urgent:   { cls:'pill-urgent', label:'🔴 Urgent'       },
      open:     { cls:'pill-open',   label:'Open'            },
      funded:   { cls:'pill-funded', label:'✅ Funded'        },
      review:   { cls:'pill-review', label:'🔍 Under Review' },
      progress: { cls:'pill-review', label:'⏳ In Progress'  },
      done:     { cls:'pill-done',   label:'✓ Completed'     },
    };

    issues.forEach(issue => {
      const pill = pillMap[issue.status] || pillMap.open;

      const row = document.createElement('div');
      row.className = 'issue-row';
      row.innerHTML = `
        <div class="issue-pill ${pill.cls}">${pill.label}</div>
        <div class="issue-title">${issue.title}</div>
        <div class="issue-foot">
          <span class="vote-count">
            ▲ ${Number(issue.votes).toLocaleString('en-IN')} votes
          </span>
          <button class="vote-btn" data-id="${issue.id}">▲ Vote</button>
        </div>
      `;

      issuesCard.appendChild(row);

      const vBtn = row.querySelector('.vote-btn');
      const voted = localStorage.getItem(`yl_voted_${issue.id}`) === 'true';

      if (voted) {
        vBtn.textContent      = '✓ Voted';
        vBtn.disabled         = true;
        vBtn.style.opacity    = '0.55';
        vBtn.style.background = 'var(--green-light)';
        vBtn.style.color      = 'var(--green)';
        vBtn.style.borderColor= 'var(--green-mid)';
      } else {
        vBtn.addEventListener('click', () => {
          fetch(`http://127.0.0.1:8000/api/issues/${issue.id}/vote/`,
            { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                row.querySelector('.vote-count').textContent =
                  `▲ ${Number(data.votes).toLocaleString('en-IN')} votes`;
                vBtn.textContent      = '✓ Voted';
                vBtn.disabled         = true;
                vBtn.style.opacity    = '0.55';
                vBtn.style.background = 'var(--green-light)';
                vBtn.style.color      = 'var(--green)';
                vBtn.style.borderColor= 'var(--green-mid)';
                localStorage.setItem(`yl_voted_${issue.id}`, 'true');
                showToast('Vote counted! ▲', 'success');
              }
            })
            .catch(() => showToast('Vote failed.', 'error'));
        });
      }
    });
  }

  function updateBalanceCard(data) {
    const balAmount = document.querySelector('.bal-amount');
    if (balAmount) {
      balAmount.textContent =
        '₹' + Number(data.balance).toLocaleString('en-IN');
    }

    const pct    = data.total_received > 0
      ? Math.round((data.total_spent / data.total_received) * 100)
      : 0;
    const balBar = document.querySelector('.bal-bar');
    if (balBar) {
      balBar.style.width      = '0%';
      balBar.style.transition = 'width 1.4s ease';
      setTimeout(() => balBar.style.width = pct + '%', 400);
    }

    const balMeta = document.querySelectorAll('.bal-meta span');
    if (balMeta[0]) balMeta[0].textContent =
      `₹${formatLakhs(data.total_spent)} spent`;
    if (balMeta[1]) balMeta[1].textContent = `${pct}% utilized`;

    const splitVals = document.querySelectorAll('.split-val');
    if (splitVals[0]) splitVals[0].textContent =
      '₹' + formatLakhs(data.total_received);
    if (splitVals[1]) splitVals[1].textContent =
      '₹' + formatLakhs(data.total_spent);
  }

  document.querySelectorAll('.btn-outline').forEach(btn => {
    if (btn.textContent.includes('Transaction')) {
      btn.addEventListener('click', () => {
        window.location.href = 'transactions.html';
      });
    }
  });

  document.querySelectorAll('.btn-solid').forEach(btn => {
    if (btn.textContent.includes('Raise')) {
      btn.addEventListener('click', () => {
        window.location.href = 'issues.html';
      });
    }
  });

  loadStats();

}); 