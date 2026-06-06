// ============================================================
//  YourSay — issues.js  (runs only on issues.html)
//  Fixed: vote button count parsing was breaking
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── VOTE BUTTONS ─────────────────────────────────────────────
  // THE BUG: Parsing "▲ 2,341 votes" was unreliable.
  // THE FIX: Store the count as a data attribute on the card
  //          so we always have a clean number to work with.

  // Load what the user has already voted on
  const userVoted  = JSON.parse(localStorage.getItem('yl_voted'))  || {};
  const savedCounts= JSON.parse(localStorage.getItem('yl_counts')) || {};

  document.querySelectorAll('.issue-card').forEach(card => {
    const voteBtn    = card.querySelector('.vote-btn');
    const voteInfo   = card.querySelector('.vote-info');
    const issueNumEl = card.querySelector('.issue-num');

    if (!voteBtn || !voteInfo || !issueNumEl) return;

    // Get issue ID — strip "#" and spaces
    const id = issueNumEl.textContent.replace('#','').trim();

    // Parse the current count from HTML text
    // "▲ 2,341 votes" → remove everything except digits and commas
    const rawText = voteInfo.textContent.replace(/[^0-9,]/g,'').replace(/,/g,'');
    const htmlCount = parseInt(rawText) || 0;

    // Use saved count if it exists, otherwise use the HTML count
    let count = savedCounts[id] !== undefined ? savedCounts[id] : htmlCount;

    // Display the count (formatted with Indian number system)
    voteInfo.textContent = `▲ ${count.toLocaleString('en-IN')} votes`;

    // If user already voted on this issue — show voted state
    if (userVoted[id]) {
      voteBtn.textContent      = '✓ Voted';
      voteBtn.disabled         = true;
      voteBtn.style.opacity    = '0.55';
      voteBtn.style.cursor     = 'default';
      voteBtn.style.background = 'var(--green-light)';
      voteBtn.style.color      = 'var(--green)';
      voteBtn.style.borderColor= 'var(--green-mid)';
    }

    // Click handler
    voteBtn.addEventListener('click', () => {
      if (userVoted[id]) return; // already voted — do nothing

      // Increment
      count++;

      // Update display
      voteInfo.textContent = `▲ ${count.toLocaleString('en-IN')} votes`;

      // Update button look
      voteBtn.textContent      = '✓ Voted';
      voteBtn.disabled         = true;
      voteBtn.style.opacity    = '0.55';
      voteBtn.style.cursor     = 'default';
      voteBtn.style.background = 'var(--green-light)';
      voteBtn.style.color      = 'var(--green)';
      voteBtn.style.borderColor= 'var(--green-mid)';

      // Save to localStorage
      userVoted[id]   = true;
      savedCounts[id] = count;
      localStorage.setItem('yl_voted',  JSON.stringify(userVoted));
      localStorage.setItem('yl_counts', JSON.stringify(savedCounts));

      // Toast (from app.js)
      showToast('Vote counted! ▲', 'success');
    });
  });


  // ── TAB FILTERING ─────────────────────────────────────────────
  // Clicking a tab filters cards by their pill label.

  const tabs = document.querySelectorAll('.tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {

      // Update active tab style
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Get filter keyword from tab text (strip numbers)
      const keyword = tab.textContent.replace(/\d+/g,'').trim().toLowerCase();

      document.querySelectorAll('.issue-card').forEach(card => {
        if (keyword === 'all') {
          card.style.display = '';
          return;
        }

        const pill = card.querySelector('.issue-pill');
        if (!pill) { card.style.display = 'none'; return; }

        const pillText = pill.textContent.toLowerCase();

        // Match pill text against tab keyword
        const show =
          (keyword === 'urgent'       && pillText.includes('urgent'))  ||
          (keyword === 'open'         && pillText.includes('open'))    ||
          (keyword === 'funded'       && pillText.includes('funded'))  ||
          (keyword === 'under review' && pillText.includes('review'))  ||
          (keyword === 'completed'    && (pillText.includes('completed') || pillText.includes('done')));

        card.style.display = show ? '' : 'none';
      });

      // Show "no results" if nothing is visible
      const grid    = document.querySelector('.issues-grid');
      const visible = grid
        ? [...grid.querySelectorAll('.issue-card')].filter(c => c.style.display !== 'none').length
        : 0;

      let msg = document.getElementById('no-results-msg');
      if (visible === 0) {
        if (!msg && grid) {
          msg = document.createElement('p');
          msg.id = 'no-results-msg';
          msg.style.cssText = 'color:var(--muted);font-size:.9rem;padding:24px 0;grid-column:1/-1;';
          msg.textContent   = 'No issues in this category yet.';
          grid.appendChild(msg);
        }
      } else {
        if (msg) msg.remove();
      }
    });
  });


  // ── RAISE ISSUE FORM ─────────────────────────────────────────
  // Validates fields, creates a new card, saves to localStorage.

  const submitBtn = document.querySelector('.raise-section .submit-btn');

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {

      // Grab field values
      const fields = {
        title:    document.querySelector('.raise-form input[placeholder*="Brief"]'),
        location: document.querySelector('.raise-form input[placeholder*="District"]'),
        category: document.querySelector('.raise-form select'),
        fund:     document.querySelector('.raise-form input[placeholder*="₹"]'),
        desc:     document.querySelector('.raise-form textarea'),
      };

      const val = {
        title:    fields.title    ? fields.title.value.trim()    : '',
        location: fields.location ? fields.location.value.trim() : '',
        category: fields.category ? fields.category.value        : '',
        fund:     fields.fund     ? fields.fund.value.trim()     : 'TBD',
        desc:     fields.desc     ? fields.desc.value.trim()     : '',
      };

      // Validate
      if (!val.title)                                { showToast('Please enter an issue title.','error');    return; }
      if (!val.location)                             { showToast('Please enter the location.','error');      return; }
      if (!val.category || val.category==='Select category') { showToast('Please select a category.','error');   return; }
      if (!val.desc)                                 { showToast('Please describe the problem.','error');    return; }

      // Build card
      const grid = document.querySelector('.issues-grid');
      if (!grid) return;

      const id   = Math.floor(Math.random()*900)+100;
      const card = document.createElement('div');
      card.className = 'issue-card';
      card.style.cssText = 'border:1.5px solid var(--green-mid);animation:fadeUp .4s ease both;';
      card.innerHTML = `
        <div class="card-top">
          <span class="issue-pill pill-review">🔍 Under Review</span>
          <span class="issue-num">#${id}</span>
        </div>
        <div class="issue-title">${val.title}</div>
        <div class="issue-desc">${val.desc}</div>
        <div class="issue-meta">
          <span class="meta-item">📍 ${val.location}</span>
          <span class="meta-item">🏷 ${val.category}</span>
          <span class="meta-item">📅 Just now</span>
        </div>
        <div class="fund-progress">
          <div class="fp-top">
            <span class="fp-raised">₹0 raised</span>
            <span class="fp-goal">Goal: ${val.fund}</span>
          </div>
          <div class="fp-bar-wrap"><div class="fp-bar" style="width:0%"></div></div>
        </div>
        <div class="card-foot">
          <span class="vote-info">▲ 1 votes</span>
          <div style="display:flex;gap:10px;align-items:center;">
            <button class="vote-btn" disabled style="opacity:.55;cursor:default;background:var(--green-light);color:var(--green);border-color:var(--green-mid)">✓ Voted</button>
          </div>
        </div>
      `;

      grid.insertBefore(card, grid.firstChild);

      // Save to localStorage
      const saved = JSON.parse(localStorage.getItem('yl_issues')) || [];
      saved.unshift({ id, ...val });
      localStorage.setItem('yl_issues', JSON.stringify(saved));

      // Clear fields
      Object.values(fields).forEach(f => { if(f) f.value = f.tagName==='SELECT' ? f.options[0].value : ''; });

      // Scroll to new card and show toast
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Issue submitted! Under review now. ✓', 'success');
    });
  }


  // ── SCROLL TO FORM (hero "Raise an Issue" button) ────────────
  document.querySelectorAll('.raise-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = document.querySelector('.raise-section');
      if (form) form.scrollIntoView({ behavior: 'smooth' });
    });
  });


  // ── LOAD PREVIOUSLY SUBMITTED ISSUES ─────────────────────────
  const saved = JSON.parse(localStorage.getItem('yl_issues')) || [];
  const grid  = document.querySelector('.issues-grid');

  if (saved.length && grid) {
    saved.forEach(issue => {
      const exists = [...grid.querySelectorAll('.issue-num')]
        .some(el => el.textContent === `#${issue.id}`);
      if (exists) return;

      const card = document.createElement('div');
      card.className = 'issue-card';
      card.style.border = '1.5px solid var(--green-mid)';
      card.innerHTML = `
        <div class="card-top">
          <span class="issue-pill pill-review">🔍 Under Review</span>
          <span class="issue-num">#${issue.id}</span>
        </div>
        <div class="issue-title">${issue.title}</div>
        <div class="issue-desc">${issue.desc}</div>
        <div class="issue-meta">
          <span class="meta-item">📍 ${issue.location}</span>
          <span class="meta-item">🏷 ${issue.category}</span>
        </div>
        <div class="fund-progress">
          <div class="fp-top">
            <span class="fp-raised">₹0 raised</span>
            <span class="fp-goal">Goal: ${issue.fund}</span>
          </div>
          <div class="fp-bar-wrap"><div class="fp-bar" style="width:0%"></div></div>
        </div>
        <div class="card-foot">
          <span class="vote-info">▲ 1 votes</span>
          <div style="display:flex;gap:10px;align-items:center;">
            <button class="vote-btn" disabled style="opacity:.55;cursor:default;background:var(--green-light);color:var(--green);border-color:var(--green-mid)">✓ Voted</button>
          </div>
        </div>
      `;
      grid.insertBefore(card, grid.firstChild);
    });
  }

}); // end DOMContentLoaded
