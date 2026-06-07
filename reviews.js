document.addEventListener('DOMContentLoaded', () => {
  let userRating = 0; // 0 means not selected yet

  const stars = document.querySelectorAll('.star-pick');

  stars.forEach((star, index) => {
    star.removeAttribute('onclick');

    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => {
        s.style.filter  = i <= index ? 'none'        : 'grayscale(1)';
        s.style.opacity = i <= index ? '1'           : '0.3';
      });
    });
    star.addEventListener('mouseleave', () => {
      updateStarDisplay(userRating);
    });

    star.addEventListener('click', () => {
      userRating = index + 1; 
      updateStarDisplay(userRating);
      showToast(`You rated ${userRating} star${userRating > 1 ? 's' : ''}`, 'info');
    });
  });

  function updateStarDisplay(rating) {
    stars.forEach((s, i) => {
      s.style.filter  = i < rating ? 'none'        : 'grayscale(1)';
      s.style.opacity = i < rating ? '1'           : '0.3';
    });
  }

  const starPicker = document.querySelector('.star-picker');
  if (starPicker) {
    starPicker.addEventListener('mouseleave', () => {
      updateStarDisplay(userRating);
    });
  }

  const submitBtn = document.querySelector('.form-body .submit-btn');

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {

      const nameInput     = document.querySelector('.form-body input[placeholder*="appear"]');
      const locationInput = document.querySelector('.form-body input[placeholder*="City"]');
      const typeSelect    = document.querySelector('.form-body select');
      const reviewText    = document.querySelector('.form-body textarea');

      const name     = nameInput     ? nameInput.value.trim()     : '';
      const location = locationInput ? locationInput.value.trim() : '';
      const type     = typeSelect    ? typeSelect.value           : '';
      const text     = reviewText    ? reviewText.value.trim()    : '';

      if (!name) {
        showToast('Please enter your name.', 'error');
        if (nameInput) nameInput.focus();
        return;
      }
      if (userRating === 0) {
        showToast('Please select a star rating.', 'error');
        return;
      }
      if (!text || text.length < 20) {
        showToast('Please write at least 20 characters.', 'error');
        if (reviewText) reviewText.focus();
        return;
      }
      if (!type || type === 'Select type') {
        showToast('Please select a feedback type.', 'error');
        return;
      }

      const starStr = '⭐'.repeat(userRating);

      const today = new Date().toLocaleDateString('en-IN', {
        day:'numeric', month:'short', year:'numeric'
      });

      const pillMap = {
        'UI / Design':       { cls:'cat-ui',      label:'UI / Design'    },
        'Feature Request':   { cls:'cat-feature',  label:'Feature Request'},
        'Bug Report':        { cls:'cat-bug',      label:'Bug Report'     },
        'Content Feedback':  { cls:'cat-content',  label:'Content'        },
        'General Review':    { cls:'cat-general',  label:'General'        },
      };
      const pill = pillMap[type] || { cls:'cat-general', label:'General' };

      const avatarColors = ['av-green','av-blue','av-red','av-purple','av-gold','av-ink'];
      const colorIndex   = name.charCodeAt(0) % avatarColors.length;
      const avatarClass  = avatarColors[colorIndex];

      const parts    = name.toUpperCase().split(' ');
      const initials = parts.length >= 2
        ? parts[0][0] + parts[parts.length-1][0]
        : parts[0].substring(0,2);

      const feed     = document.querySelector('.feed-head').parentElement;
      const firstCard= document.querySelector('.pinned-card') ||
                       document.querySelector('.review-card');

      const newCard  = document.createElement('div');
      newCard.className = 'review-card';
      newCard.style.cssText = 'border:1.5px solid var(--green-mid);animation:fadeUp .4s ease both;';
      newCard.innerHTML = `
        <div class="rc-top">
          <div class="rc-user">
            <div class="avatar ${avatarClass}">${initials}</div>
            <div>
              <div class="user-name">${name}</div>
              <div class="user-meta">${location ? '📍 ' + location + ' · ' : ''}${today}</div>
            </div>
          </div>
          <div class="rc-right">
            <div class="stars">${starStr}</div>
            <span class="rc-cat ${pill.cls}">${pill.label}</span>
          </div>
        </div>
        <div class="review-text">${text}</div>
        <div class="rc-footer">
          <button class="helpful-btn" data-count="0">👍 Helpful (0)</button>
          <span class="rc-date">${today}</span>
        </div>
      `;

      if (firstCard && firstCard.nextSibling) {
        feed.insertBefore(newCard, firstCard.nextSibling);
      } else if (firstCard) {
        feed.appendChild(newCard);
      }

      attachHelpfulBtn(newCard.querySelector('.helpful-btn'));

      const savedReviews = JSON.parse(localStorage.getItem('yl_reviews')) || [];
      savedReviews.unshift({ name, location, type, text, rating:userRating, date:today });
      localStorage.setItem('yl_reviews', JSON.stringify(savedReviews));

      if (nameInput)     nameInput.value     = '';
      if (locationInput) locationInput.value = '';
      if (typeSelect)    typeSelect.value    = 'Select type';
      if (reviewText)    reviewText.value    = '';
      userRating = 0;
      updateStarDisplay(0);

      newCard.scrollIntoView({ behavior:'smooth', block:'center' });
      showToast('Review posted! Thank you. ✓', 'success');
    });
  }

  const clickedHelpful = new Set(
    JSON.parse(sessionStorage.getItem('yl_helpful')) || []
  );

  function attachHelpfulBtn(btn) {
    if (!btn) return;

    btn.addEventListener('click', () => {
      const btnId = btn.closest('.review-card, .pinned-card')
        ?.querySelector('.user-name')?.textContent || btn.textContent;

      if (clickedHelpful.has(btnId)) {
        showToast('You already marked this as helpful.', 'info');
        return;
      }

      const current = parseInt(btn.dataset.count) || 0;
      const next    = current + 1;
      btn.dataset.count  = next;
      btn.textContent    = `👍 Helpful (${next})`;
      btn.style.color    = 'var(--green)';
      btn.style.borderColor = 'var(--green-mid)';

      clickedHelpful.add(btnId);
      sessionStorage.setItem('yl_helpful', JSON.stringify([...clickedHelpful]));

      showToast('Marked as helpful!', 'success');
    });
  }

  document.querySelectorAll('.helpful-btn').forEach(btn => {
    const match = btn.textContent.match(/\((\d+)\)/);
    if (match) btn.dataset.count = match[1];
    attachHelpfulBtn(btn);
  });


  const savedReviews = JSON.parse(localStorage.getItem('yl_reviews')) || [];
  const feed         = document.querySelector('.pinned-card')?.parentElement
                    || document.querySelector('.review-card')?.parentElement;
  const anchor       = document.querySelector('.pinned-card') || document.querySelector('.review-card');

  if (savedReviews.length && feed && anchor) {
    savedReviews.forEach(r => {
      const starStr     = '⭐'.repeat(r.rating || 5);
      const pillMap     = {
        'UI / Design':      {cls:'cat-ui',     label:'UI / Design'},
        'Feature Request':  {cls:'cat-feature',label:'Feature Request'},
        'Bug Report':       {cls:'cat-bug',    label:'Bug Report'},
        'Content Feedback': {cls:'cat-content',label:'Content'},
        'General Review':   {cls:'cat-general',label:'General'},
      };
      const pill        = pillMap[r.type] || {cls:'cat-general',label:'General'};
      const colors      = ['av-green','av-blue','av-red','av-purple','av-gold','av-ink'];
      const avatarClass = colors[r.name.charCodeAt(0) % colors.length];
      const parts       = r.name.toUpperCase().split(' ');
      const initials    = parts.length>=2 ? parts[0][0]+parts[parts.length-1][0] : parts[0].substring(0,2);

      const card = document.createElement('div');
      card.className = 'review-card';
      card.style.border = '1.5px solid var(--green-mid)';
      card.innerHTML = `
        <div class="rc-top">
          <div class="rc-user">
            <div class="avatar ${avatarClass}">${initials}</div>
            <div>
              <div class="user-name">${r.name}</div>
              <div class="user-meta">${r.location ? '📍 '+r.location+' · ':'' }${r.date}</div>
            </div>
          </div>
          <div class="rc-right">
            <div class="stars">${starStr}</div>
            <span class="rc-cat ${pill.cls}">${pill.label}</span>
          </div>
        </div>
        <div class="review-text">${r.text}</div>
        <div class="rc-footer">
          <button class="helpful-btn" data-count="0">👍 Helpful (0)</button>
          <span class="rc-date">${r.date}</span>
        </div>
      `;
      feed.insertBefore(card, anchor.nextSibling);
      attachHelpfulBtn(card.querySelector('.helpful-btn'));
    });
  }

}); 
