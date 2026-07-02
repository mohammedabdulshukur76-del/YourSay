const API = 'https://yoursay-backend-g6ri.onrender.com/api/issues/';

document.addEventListener('DOMContentLoaded', () => {

  function loadIssues() {
    const grid = document.querySelector('.issues-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;
        padding:40px;color:var(--muted);font-size:.9rem;">
        Loading issues...
      </div>
    `;

    fetch(API)
      .then(res => res.json())
      .then(data => {
        grid.innerHTML = ''; 
        if (data.issues.length === 0) {
          grid.innerHTML = `
            <p style="grid-column:1/-1;color:var(--muted);
              padding:24px 0;font-size:.9rem;">
              No issues yet. Be the first to raise one.
            </p>`;
          return;
        }
        data.issues.forEach(issue => renderIssueCard(issue, grid));
      })
      .catch(err => {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;
            padding:40px;color:var(--red);font-size:.9rem;">
            Could not load issues. Make sure the backend is running.
          </div>
        `;
      });
  }

  function renderIssueCard(issue, grid) {

    const pillMap = {
      urgent:   { cls:'pill-urgent',  label:'🔴 Urgent'       },
      open:     { cls:'pill-open',    label:'Open'            },
      funded:   { cls:'pill-funded',  label:'✅ Funded'        },
      review:   { cls:'pill-review',  label:'🔍 Under Review' },
      progress: { cls:'pill-review',  label:'⏳ In Progress'  },
      done:     { cls:'pill-done',    label:'✓ Completed'     },
    };
    const pill = pillMap[issue.status] || pillMap.open;

    const pct = issue.fund_goal > 0
      ? Math.min(100, Math.round((issue.fund_raised / issue.fund_goal) * 100))
      : 0;

    const fmtNum = n => Number(n).toLocaleString('en-IN');
    const fmtAmt = n => '₹' + fmtNum(n);

    const voted = localStorage.getItem(`yl_voted_${issue.id}`) === 'true';

    const card = document.createElement('div');
    card.className = 'issue-card';
    card.dataset.id     = issue.id;
    card.dataset.status = issue.status;
    card.innerHTML = `
      <div class="card-top">
        <span class="issue-pill ${pill.cls}">${pill.label}</span>
        <span class="issue-num">#${issue.id}</span>
      </div>
      <div class="issue-title">${issue.title}</div>
      <div class="issue-desc">${issue.description}</div>
      <div class="issue-meta">
        <span class="meta-item">📍 ${issue.location}</span>
        <span class="meta-item">🏷 ${issue.category}</span>
        <span class="meta-item">📅 ${issue.created_at}</span>
      </div>
      <div class="fund-progress">
        <div class="fp-top">
          <span class="fp-raised">${fmtAmt(issue.fund_raised)} raised</span>
          <span class="fp-goal">Goal: ${fmtAmt(issue.fund_goal)}</span>
        </div>
        <div class="fp-bar-wrap">
          <div class="fp-bar" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="card-foot">
        <span class="vote-info" id="votes-${issue.id}">
          ▲ ${fmtNum(issue.votes)} votes
        </span>
        <button class="vote-btn" id="vbtn-${issue.id}"
          ${voted ? 'disabled style="opacity:.55;cursor:default;background:var(--green-light);color:var(--green);border-color:var(--green-mid)"' : ''}>
          ${voted ? '✓ Voted' : '▲ Vote'}
        </button>
      </div>
    `;

    grid.appendChild(card);

    const vBtn = card.querySelector(`#vbtn-${issue.id}`);
    if (vBtn && !voted) {
      vBtn.addEventListener('click', () => voteOnIssue(issue.id));
    }
  }

  function voteOnIssue(issueId) {
    const vBtn  = document.getElementById(`vbtn-${issueId}`);
    const vInfo = document.getElementById(`votes-${issueId}`);
    if (!vBtn) return;

    vBtn.disabled = true;
    vBtn.textContent = '...';

    fetch(`${API}${issueId}/vote/`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          vInfo.textContent =
            `▲ ${Number(data.votes).toLocaleString('en-IN')} votes`;

          vBtn.textContent      = '✓ Voted';
          vBtn.style.opacity    = '0.55';
          vBtn.style.cursor     = 'default';
          vBtn.style.background = 'var(--green-light)';
          vBtn.style.color      = 'var(--green)';
          vBtn.style.borderColor= 'var(--green-mid)';

          localStorage.setItem(`yl_voted_${issueId}`, 'true');

          showToast('Vote counted! ▲', 'success');
        }
      })
      .catch(() => {
        vBtn.disabled    = false;
        vBtn.textContent = '▲ Vote';
        showToast('Vote failed. Try again.', 'error');
      });
  }


  const submitBtn = document.querySelector('.raise-section .submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {

      const fields = {
        title:    document.querySelector('.raise-form input[placeholder*="Brief"]'),
        location: document.querySelector('.raise-form input[placeholder*="District"]'),
        category: document.querySelector('.raise-form select'),
        fund:     document.querySelector('.raise-form input[placeholder*="₹"]'),
        desc:     document.querySelector('.raise-form textarea'),
      };

      const val = {
        title:        fields.title    ? fields.title.value.trim()    : '',
        location:     fields.location ? fields.location.value.trim() : '',
        category:     fields.category ? fields.category.value        : '',
        fund_goal:    fields.fund     ? fields.fund.value.replace(/[^0-9.]/g,'') || 0 : 0,
        description:  fields.desc     ? fields.desc.value.trim()     : '',
        submitted_by: 'Anonymous',
      };

      if (!val.title)    { showToast('Please enter a title.','error');    return; }
      if (!val.location) { showToast('Please enter location.','error');   return; }
      if (!val.category || val.category === 'Select category') {
        showToast('Please select a category.','error'); return;
      }
      if (!val.description) { showToast('Please describe the problem.','error'); return; }

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Submitting...';

      fetch(`${API}submit/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(val),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            Object.values(fields).forEach(f => {
              if (f) f.value = f.tagName === 'SELECT' ? f.options[0].value : '';
            });

            showToast('Issue submitted! Under review now ✓', 'success');

            loadIssues();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        })
        .catch(() => {
          showToast('Submission failed. Check your connection.', 'error');
        })
        .finally(() => {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Submit Issue for Review';
        });
    });
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const keyword = tab.textContent.replace(/\d+/g,'').trim().toLowerCase();

      document.querySelectorAll('.issue-card').forEach(card => {
        if (keyword === 'all') { card.style.display = ''; return; }
        const status = card.dataset.status || '';
        const show =
          (keyword === 'urgent'       && status === 'urgent')   ||
          (keyword === 'open'         && status === 'open')     ||
          (keyword === 'funded'       && status === 'funded')   ||
          (keyword === 'under review' && status === 'review')   ||
          (keyword === 'completed'    && status === 'done');
        card.style.display = show ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('.raise-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.raise-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  loadIssues();


}); 