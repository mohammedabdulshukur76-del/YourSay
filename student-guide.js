document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          const arrow = openItem.querySelector('.faq-arrow');
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
      });

      item.classList.toggle('open', !isOpen);
      const arrow = q.querySelector('.faq-arrow');
      if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    const item  = q.closest('.faq-item');
    const arrow = q.querySelector('.faq-arrow');
    if (item.classList.contains('open') && arrow) {
      arrow.style.transform = 'rotate(180deg)';
    }
  });
  const content = document.querySelector('.content');
  if (!content) return;
  const contactSection = document.querySelector('.contact-section');

  const boardSection = document.createElement('div');
  boardSection.id = 'community-board';
  boardSection.style.cssText = 'margin-bottom: 48px;';
  boardSection.innerHTML = `
    <div class="section-title" style="margin-bottom:6px;">Community Help Board</div>
    <p style="color:var(--muted);font-size:.88rem;margin-bottom:24px;line-height:1.6;">
      Struggling financially or academically? Post here — this is a public board.
      Others can see your post and reach out to help. No judgment, only support.
    </p>

    <!-- POST FORM -->
    <div id="post-form-wrap" style="
      background:var(--surface);border:1px solid var(--border);
      border-radius:14px;padding:24px;margin-bottom:28px;">
      <div style="font-family:var(--font-head);font-size:1rem;font-weight:700;
        letter-spacing:-.3px;margin-bottom:16px;">Share your situation</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div>
          <label class="form-label">Your Name</label>
          <input id="post-name" type="text" placeholder="How you'll appear"
            style="width:100%;padding:10px 13px;border:1.5px solid var(--border);
            border-radius:8px;font-family:var(--font-body);font-size:.875rem;
            color:var(--ink);outline:none;transition:border-color .15s;">
        </div>
        <div>
          <label class="form-label">Category</label>
          <select id="post-category"
            style="width:100%;padding:10px 13px;border:1.5px solid var(--border);
            border-radius:8px;font-family:var(--font-body);font-size:.875rem;
            color:var(--ink);background:#fff;outline:none;">
            <option value="">Select type</option>
            <option value="financial"> Financial Help Needed</option>
            <option value="academic"> Academic Support</option>
            <option value="mentor"> Need a Mentor</option>
            <option value="collaboration"> Looking to Collaborate</option>
            <option value="other"> Other</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:14px;">
        <label class="form-label">Your Message</label>
        <textarea id="post-message" placeholder="Explain your situation — be as honest as you need to be. This community is here to help..."
          style="width:100%;padding:10px 13px;border:1.5px solid var(--border);
          border-radius:8px;font-family:var(--font-body);font-size:.875rem;
          color:var(--ink);outline:none;resize:vertical;min-height:90px;
          transition:border-color .15s;"></textarea>
      </div>
      <button id="post-submit" style="
        background:var(--green);color:#fff;padding:11px 22px;border-radius:8px;
        font-weight:600;font-size:.88rem;cursor:pointer;border:none;
        font-family:var(--font-body);transition:opacity .15s;">
        Post to Community
      </button>
    </div>

    <!-- POSTS FEED -->
    <div id="posts-feed"></div>
  `;

  if (contactSection) {
    content.insertBefore(boardSection, contactSection);
  } else {
    content.appendChild(boardSection);
  }

  boardSection.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('focus',  () => el.style.borderColor = 'var(--green)');
    el.addEventListener('blur',   () => el.style.borderColor = 'var(--border)');
  });


  const catConfig = {
    financial:     { label:' Financial Help',   bg:'var(--gold-light)',   color:'var(--gold)'   },
    academic:      { label:' Academic Support', bg:'var(--blue-light)',   color:'var(--blue)'   },
    mentor:        { label:' Need a Mentor',    bg:'var(--purple-light)', color:'var(--purple)' },
    collaboration: { label:' Collaborate',      bg:'var(--green-light)',  color:'var(--green)'  },
    other:         { label:' Other',            bg:'var(--surface)',      color:'var(--muted)'  },
  };

  const avatarColors = ['#1a7a44','#1a5fa8','#c0392b','#6b3fa0','#b07d1a','#111612'];
  function getAvatar(name) {
    const color  = avatarColors[name.charCodeAt(0) % avatarColors.length];
    const parts  = name.toUpperCase().split(' ');
    const initials = parts.length >= 2 ? parts[0][0]+parts[parts.length-1][0] : parts[0].substring(0,2);
    return { color, initials };
  }


  function renderPost(post) {
    const feed = document.getElementById('posts-feed');
    if (!feed) return;

    const cat  = catConfig[post.category] || catConfig.other;
    const av   = getAvatar(post.name);
    const replies = post.replies || [];

    const card = document.createElement('div');
    card.id    = `post-${post.id}`;
    card.style.cssText = `
      border:1px solid var(--border);border-radius:12px;
      overflow:hidden;margin-bottom:16px;
      animation:fadeUp .4s ease both;
    `;
    card.innerHTML = `
      <div style="padding:20px 20px 16px;">
        <!-- Post header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:50%;background:${av.color};
              display:flex;align-items:center;justify-content:center;
              color:#fff;font-size:.78rem;font-weight:700;flex-shrink:0;">
              ${av.initials}
            </div>
            <div>
              <div style="font-weight:600;font-size:.88rem;">${post.name}</div>
              <div style="font-size:.72rem;color:var(--muted);">${post.date}</div>
            </div>
          </div>
          <span style="font-size:.68rem;font-weight:700;padding:3px 9px;border-radius:4px;
            background:${cat.bg};color:${cat.color};white-space:nowrap;">
            ${cat.label}
          </span>
        </div>

        <!-- Post message -->
        <p style="font-size:.875rem;line-height:1.65;color:var(--ink);margin-bottom:14px;">
          ${post.message}
        </p>

        <!-- Reply count + toggle -->
        <button class="reply-toggle" data-id="${post.id}" style="
          background:none;border:none;color:var(--green);font-size:.8rem;
          font-weight:600;cursor:pointer;font-family:var(--font-body);padding:0;">
          💬 ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'} — Add yours
        </button>
      </div>

      <!-- REPLIES SECTION (hidden by default) -->
      <div class="replies-section" id="replies-${post.id}" style="display:none;
        border-top:1px solid var(--border);background:var(--surface);padding:16px 20px;">

        <!-- Existing replies -->
        <div class="replies-list" id="replies-list-${post.id}">
          ${replies.map(r => renderReplyHTML(r)).join('')}
        </div>

        <!-- Reply form -->
        <div style="margin-top:12px;">
          <div style="display:flex;gap:10px;">
            <input class="reply-name-input" placeholder="Your name"
              style="flex:0.4;padding:8px 12px;border:1.5px solid var(--border);
              border-radius:7px;font-family:var(--font-body);font-size:.82rem;
              color:var(--ink);outline:none;">
            <input class="reply-msg-input" placeholder="Write a reply or offer to help..."
              style="flex:1;padding:8px 12px;border:1.5px solid var(--border);
              border-radius:7px;font-family:var(--font-body);font-size:.82rem;
              color:var(--ink);outline:none;">
            <button class="reply-submit" data-id="${post.id}" style="
              background:var(--ink);color:#fff;padding:8px 16px;border-radius:7px;
              font-size:.8rem;font-weight:600;cursor:pointer;border:none;
              font-family:var(--font-body);white-space:nowrap;">
              Reply
            </button>
          </div>
        </div>
      </div>
    `;

    feed.insertBefore(card, feed.firstChild);

    card.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('focus', () => inp.style.borderColor = 'var(--green)');
      inp.addEventListener('blur',  () => inp.style.borderColor = 'var(--border)');
    });

    card.querySelector('.reply-toggle').addEventListener('click', () => {
      const section = document.getElementById(`replies-${post.id}`);
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';
    });

    card.querySelector('.reply-submit').addEventListener('click', () => {
      const nameInp = card.querySelector('.reply-name-input');
      const msgInp  = card.querySelector('.reply-msg-input');
      const rName   = nameInp ? nameInp.value.trim() : '';
      const rMsg    = msgInp  ? msgInp.value.trim()  : '';

      if (!rName) { showToast('Please enter your name.', 'error'); return; }
      if (!rMsg)  { showToast('Please write a reply.', 'error');   return; }

      const reply = {
        name: rName,
        message: rMsg,
        date: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
      };

      const repliesList = document.getElementById(`replies-list-${post.id}`);
      const replyEl     = document.createElement('div');
      replyEl.innerHTML = renderReplyHTML(reply);
      repliesList.appendChild(replyEl.firstChild);

      const allPosts = JSON.parse(localStorage.getItem('yl_community_posts')) || [];
      const idx      = allPosts.findIndex(p => p.id === post.id);
      if (idx !== -1) {
        allPosts[idx].replies = allPosts[idx].replies || [];
        allPosts[idx].replies.push(reply);
        localStorage.setItem('yl_community_posts', JSON.stringify(allPosts));
      }

      const toggle = card.querySelector('.reply-toggle');
      const count  = (allPosts[idx]?.replies || []).length;
      toggle.textContent = `💬 ${count} ${count === 1 ? 'reply' : 'replies'} — Add yours`;

      if (nameInp) nameInp.value = '';
      if (msgInp)  msgInp.value  = '';

      showToast('Reply posted!', 'success');
    });
  }

  function renderReplyHTML(reply) {
    const av = getAvatar(reply.name);
    return `
      <div style="display:flex;gap:10px;margin-bottom:12px;align-items:flex-start;">
        <div style="width:28px;height:28px;border-radius:50%;background:${av.color};
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:.65rem;font-weight:700;flex-shrink:0;">
          ${av.initials}
        </div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:8px;
          padding:10px 13px;flex:1;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:.78rem;font-weight:600;">${reply.name}</span>
            <span style="font-size:.7rem;color:var(--muted);">${reply.date}</span>
          </div>
          <div style="font-size:.82rem;color:var(--ink);line-height:1.5;">${reply.message}</div>
        </div>
      </div>
    `;
  }


  const savedPosts = JSON.parse(localStorage.getItem('yl_community_posts')) || [];

  if (savedPosts.length === 0) {
    const starterPosts = [
      {
        id: 'p001',
        name: 'Riya Sharma',
        category: 'financial',
        message: 'I am a 2nd year BSc student from Nalgonda. My father lost his job last month and we are struggling to pay this semester\'s fees. If anyone knows about emergency scholarship funds or can guide me, please reply.',
        date: 'Jun 4, 2026',
        replies: [
          { name: 'Arun K.', message: 'Riya, check the Telangana ePASS scheme — you can apply online at epass.telangana.gov.in. Also the NSP portal has emergency grants.', date: 'Jun 4, 2026' },
          { name: 'Fatima H.', message: 'I went through something similar last year. DM me and I can help you with the application process.', date: 'Jun 5, 2026' }
        ]
      },
      {
        id: 'p002',
        name: 'Karthik Reddy',
        category: 'mentor',
        message: 'I am learning Python and Django for web development. I want to build real projects but don\'t have proper guidance. Is there anyone who can mentor me or do pair programming sessions? I am a fast learner.',
        date: 'Jun 3, 2026',
        replies: [
          { name: 'Sai Teja', message: 'I\'m working as a Django developer at a startup. Happy to help on weekends. Let\'s connect.', date: 'Jun 3, 2026' }
        ]
      }
    ];
    localStorage.setItem('yl_community_posts', JSON.stringify(starterPosts));
    // Render in reverse so newest is first
    [...starterPosts].reverse().forEach(p => renderPost(p));
  } else {
    [...savedPosts].reverse().forEach(p => renderPost(p));
  }


  document.getElementById('post-submit')?.addEventListener('click', () => {
    const name     = document.getElementById('post-name')?.value.trim()    || '';
    const category = document.getElementById('post-category')?.value       || '';
    const message  = document.getElementById('post-message')?.value.trim() || '';

    if (!name)                        { showToast('Please enter your name.','error');       return; }
    if (!category)                    { showToast('Please select a category.','error');     return; }
    if (message.length < 20)          { showToast('Please write at least 20 characters.','error'); return; }

    const post = {
      id:      `p${Date.now()}`,
      name, category, message,
      date:    new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
      replies: []
    };

    const all = JSON.parse(localStorage.getItem('yl_community_posts')) || [];
    all.unshift(post);
    localStorage.setItem('yl_community_posts', JSON.stringify(all));

    renderPost(post);

    document.getElementById('post-name').value     = '';
    document.getElementById('post-category').value = '';
    document.getElementById('post-message').value  = '';

    showToast('Your post is live on the board! ✓', 'success');
  });


}); 
