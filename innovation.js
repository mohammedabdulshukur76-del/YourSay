// ============================================================
//  YourSay — innovation.js  (runs only on innovation.html)
//  Step 7b: Category filter + Like buttons + Collaboration wall
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── CATEGORY FILTER TABS ──────────────────────────────────────
  // Clicking a category tab filters the innovation cards.
  // We match each card's tag against the selected category.

  const filterTabs = document.querySelectorAll('.ftab');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {

      // Update active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selected = tab.textContent.trim().toLowerCase();

      document.querySelectorAll('.inno-card').forEach(card => {
        if (selected === 'all') {
          card.style.display = '';
          return;
        }
        const tag = card.querySelector('.ic-tag');
        if (!tag) { card.style.display = 'none'; return; }
        const tagText = tag.textContent.toLowerCase();
        card.style.display = tagText.includes(selected) ? '' : 'none';
      });
    });
  });


  // ── SORT DROPDOWN ─────────────────────────────────────────────
  const sortSelect = document.querySelector('.sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      showToast('Sorting applied.', 'info');
      // Full sort logic comes in Django phase when data is dynamic
    });
  }


  // ── LIKE BUTTONS ──────────────────────────────────────────────
  // Each card has a like count. Clicking likes it.
  // Uses localStorage so your like persists across refreshes.
  // One like per card per browser.

  const likedCards = JSON.parse(localStorage.getItem('yl_liked_innovations')) || {};

  // Featured card like button
  const featuredLike = document.querySelector('.like-btn');
  if (featuredLike) {
    const featuredId = 'featured';
    const countMatch = featuredLike.textContent.match(/\d+/);
    let   likeCount  = countMatch ? parseInt(countMatch[0]) : 0;

    if (likedCards[featuredId]) {
      likeCount = likedCards[featuredId];
      featuredLike.innerHTML  = `❤️ ${likeCount.toLocaleString('en-IN')} likes`;
      featuredLike.style.color = 'var(--red)';
      featuredLike.style.borderColor = '#f5c6c2';
    }

    featuredLike.addEventListener('click', () => {
      if (likedCards[featuredId + '_voted']) {
        showToast('You already liked this!', 'info');
        return;
      }
      likeCount++;
      likedCards[featuredId]         = likeCount;
      likedCards[featuredId+'_voted']= true;
      featuredLike.innerHTML         = `❤️ ${likeCount.toLocaleString('en-IN')} likes`;
      featuredLike.style.color       = 'var(--red)';
      featuredLike.style.borderColor = '#f5c6c2';
      localStorage.setItem('yl_liked_innovations', JSON.stringify(likedCards));
      showToast('Liked! ❤️', 'success');
    });
  }

  // Grid card like counts (shown in .ic-likes)
  document.querySelectorAll('.inno-card').forEach((card, index) => {
    const likeEl = card.querySelector('.ic-likes');
    const cardId = `card-${index}`;
    if (!likeEl) return;

    const match = likeEl.textContent.match(/\d+/);
    let count   = match ? parseInt(match[0]) : 0;

    // Restore saved count
    if (likedCards[cardId] !== undefined) {
      count = likedCards[cardId];
      likeEl.textContent = `❤ ${count}`;
      likeEl.style.color = 'var(--red)';
    }

    likeEl.style.cursor = 'pointer';
    likeEl.title        = 'Click to like';

    likeEl.addEventListener('click', () => {
      if (likedCards[cardId + '_voted']) {
        showToast('Already liked!', 'info');
        return;
      }
      count++;
      likedCards[cardId]           = count;
      likedCards[cardId + '_voted']= true;
      likeEl.textContent = `❤ ${count}`;
      likeEl.style.color = 'var(--red)';
      localStorage.setItem('yl_liked_innovations', JSON.stringify(likedCards));
      showToast('Liked! ❤️', 'success');
    });
  });


  // ── COLLABORATION WALL ────────────────────────────────────────
  // Each innovation card gets a "💬 Collaborate" button.
  // Clicking it opens a panel below the card where people
  // can post messages saying they want to work together.
  // Others can see all collaboration messages.

  const collab = JSON.parse(localStorage.getItem('yl_collabs')) || {};

  const avatarColors = ['#1a7a44','#1a5fa8','#c0392b','#6b3fa0','#b07d1a','#111612'];
  function getAv(name) {
    const c = avatarColors[name.charCodeAt(0) % avatarColors.length];
    const p = name.toUpperCase().split(' ');
    const i = p.length >= 2 ? p[0][0]+p[p.length-1][0] : p[0].substring(0,2);
    return { color: c, initials: i };
  }

  function buildCollabMessage(msg) {
    const av = getAv(msg.name);
    return `
      <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
        <div style="width:30px;height:30px;border-radius:50%;background:${av.color};
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:.68rem;font-weight:700;flex-shrink:0;">
          ${av.initials}
        </div>
        <div style="background:#fff;border:1px solid var(--border);
          border-radius:8px;padding:10px 13px;flex:1;">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="font-size:.78rem;font-weight:600;">${msg.name}</span>
            <span style="font-size:.7rem;color:var(--muted);">${msg.date}</span>
          </div>
          ${msg.contact ? `<div style="font-size:.7rem;color:var(--green);margin-bottom:4px;">📧 ${msg.contact}</div>` : ''}
          <div style="font-size:.82rem;color:var(--ink);line-height:1.5;">${msg.message}</div>
        </div>
      </div>
    `;
  }

  // Add collaborate button + panel to every grid card
  document.querySelectorAll('.inno-card').forEach((card, index) => {
    const cardId    = `inno-${index}`;
    const titleEl   = card.querySelector('.ic-title');
    const cardTitle = titleEl ? titleEl.textContent.trim() : `Innovation ${index+1}`;
    const messages  = collab[cardId] || [];

    // Add "Collaborate" button to card footer
    const footer = card.querySelector('.ic-footer');
    if (footer) {
      const collabBtn = document.createElement('button');
      collabBtn.className    = 'collab-trigger';
      collabBtn.dataset.id   = cardId;
      collabBtn.style.cssText= `
        background:none;border:none;color:var(--green);font-size:.75rem;
        font-weight:600;cursor:pointer;font-family:var(--font-body);
        display:flex;align-items:center;gap:4px;padding:0;
      `;
      collabBtn.innerHTML = `💬 ${messages.length} interested`;
      footer.appendChild(collabBtn);
    }

    // Create the collaboration panel (hidden by default)
    const panel = document.createElement('div');
    panel.id    = `collab-panel-${cardId}`;
    panel.style.cssText = `
      display:none;
      border-top:1px solid var(--border);
      background:var(--surface);
      padding:16px;
    `;
    panel.innerHTML = `
      <div style="font-family:var(--font-head);font-size:.88rem;font-weight:700;
        margin-bottom:10px;color:var(--ink);">
        🤝 Collaboration Wall — ${cardTitle.substring(0,40)}...
      </div>

      <!-- Messages list -->
      <div id="collab-msgs-${cardId}" style="margin-bottom:12px;max-height:220px;overflow-y:auto;">
        ${messages.length
          ? messages.map(m => buildCollabMessage(m)).join('')
          : `<p style="font-size:.82rem;color:var(--muted);padding:8px 0;">
               No collaborators yet. Be the first to reach out!
             </p>`
        }
      </div>

      <!-- Collaboration form -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input class="collab-name" placeholder="Your name"
            style="padding:9px 12px;border:1.5px solid var(--border);border-radius:7px;
            font-family:var(--font-body);font-size:.82rem;color:var(--ink);outline:none;width:100%;">
          <input class="collab-contact" placeholder="Email or phone (optional)"
            style="padding:9px 12px;border:1.5px solid var(--border);border-radius:7px;
            font-family:var(--font-body);font-size:.82rem;color:var(--ink);outline:none;width:100%;">
        </div>
        <textarea class="collab-msg" placeholder="Tell them why you want to collaborate — your skills, what you can contribute, or what you're looking for..."
          style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:7px;
          font-family:var(--font-body);font-size:.82rem;color:var(--ink);outline:none;
          resize:vertical;min-height:70px;margin-bottom:10px;"></textarea>
        <button class="collab-submit" data-id="${cardId}" style="
          background:var(--green);color:#fff;padding:9px 18px;border-radius:7px;
          font-size:.82rem;font-weight:600;cursor:pointer;border:none;
          font-family:var(--font-body);">
          Send Collaboration Request
        </button>
      </div>
    `;
    card.appendChild(panel);

    // Add focus styles
    panel.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('focus', () => el.style.borderColor = 'var(--green)');
      el.addEventListener('blur',  () => el.style.borderColor = 'var(--border)');
    });

    // Toggle panel when "Collaborate" button is clicked
    card.querySelector('.collab-trigger')?.addEventListener('click', () => {
      const isHidden = panel.style.display === 'none';
      // Close all other open panels first
      document.querySelectorAll('[id^="collab-panel-"]').forEach(p => {
        p.style.display = 'none';
      });
      panel.style.display = isHidden ? 'block' : 'none';
      if (isHidden) panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });

    // Submit collaboration message
    panel.querySelector('.collab-submit')?.addEventListener('click', () => {
      const name    = panel.querySelector('.collab-name')?.value.trim()    || '';
      const contact = panel.querySelector('.collab-contact')?.value.trim() || '';
      const message = panel.querySelector('.collab-msg')?.value.trim()     || '';

      if (!name)              { showToast('Please enter your name.', 'error');    return; }
      if (message.length < 10){ showToast('Please write a longer message.','error'); return; }

      const newMsg = {
        name, contact, message,
        date: new Date().toLocaleDateString('en-IN', {
          day:'numeric', month:'short', year:'numeric'
        })
      };

      // Add to DOM
      const msgList = document.getElementById(`collab-msgs-${cardId}`);
      const el      = document.createElement('div');
      el.innerHTML  = buildCollabMessage(newMsg);
      // Remove the "no collaborators" message if present
      const noMsg = msgList?.querySelector('p');
      if (noMsg) noMsg.remove();
      msgList?.appendChild(el.firstChild);

      // Save to localStorage
      collab[cardId] = collab[cardId] || [];
      collab[cardId].push(newMsg);
      localStorage.setItem('yl_collabs', JSON.stringify(collab));

      // Update button count
      const trigger = card.querySelector('.collab-trigger');
      if (trigger) trigger.innerHTML = `💬 ${collab[cardId].length} interested`;

      // Clear form
      panel.querySelector('.collab-name').value    = '';
      panel.querySelector('.collab-contact').value = '';
      panel.querySelector('.collab-msg').value     = '';

      showToast('Collaboration request sent! ✓', 'success');
    });
  });


  // ── FEATURED CARD "VIEW PROJECT" BUTTON ──────────────────────
  const viewProjectBtn = document.querySelector('.view-btn');
  if (viewProjectBtn) {
    viewProjectBtn.addEventListener('click', () => {
      showToast('Full project pages coming soon!', 'info');
    });
  }

  // Grid "View →" links
  document.querySelectorAll('.ic-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Full project pages coming in the next update!', 'info');
    });
  });


  // ── SUBMIT INNOVATION FORM ────────────────────────────────────
  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {

      const nameInput  = document.querySelector('.submit-form input[placeholder*="Full"]');
      const emailInput = document.querySelector('.submit-form input[type="email"]');
      const titleInput = document.querySelector('.submit-form input[placeholder*="Name of"]');
      const catSelect  = document.querySelector('.submit-form select');
      const descArea   = document.querySelector('.submit-form textarea');

      const name  = nameInput  ? nameInput.value.trim()  : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const title = titleInput ? titleInput.value.trim() : '';
      const cat   = catSelect  ? catSelect.value         : '';
      const desc  = descArea   ? descArea.value.trim()   : '';

      if (!name)                  { showToast('Please enter your name.','error');        return; }
      if (!title)                 { showToast('Please enter a project title.','error');  return; }
      if (!cat || cat==='Select category') { showToast('Please select a category.','error'); return; }
      if (desc.length < 30)       { showToast('Please write a longer description.','error'); return; }

      // Clear form
      [nameInput, emailInput, titleInput].forEach(i => { if(i) i.value = ''; });
      if (catSelect) catSelect.value = 'Select category';
      if (descArea)  descArea.value  = '';

      showToast(`"${title}" submitted for review! We'll get back to you soon. ✓`, 'success');
    });
  }


}); // end DOMContentLoaded
