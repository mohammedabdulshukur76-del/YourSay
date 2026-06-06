// ============================================================
//  YourSay — reviews.js  (runs only on reviews.html)
//  Step 3: Star picker, submit review live, helpful button
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── STAR RATING PICKER ───────────────────────────────────────
  // When you hover over a star, all stars up to that one light up.
  // When you click, the rating is locked in.
  // We store the selected rating in a variable called userRating.

  let userRating = 0; // 0 means not selected yet

  const stars = document.querySelectorAll('.star-pick');

  stars.forEach((star, index) => {
    // Remove the old onclick="setRating()" from HTML — use JS only
    star.removeAttribute('onclick');

    // Hover — light up stars up to this one
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => {
        s.style.filter  = i <= index ? 'none'        : 'grayscale(1)';
        s.style.opacity = i <= index ? '1'           : '0.3';
      });
    });

    // Mouse leaves the whole picker — go back to selected rating
    star.addEventListener('mouseleave', () => {
      updateStarDisplay(userRating);
    });

    // Click — lock in this rating
    star.addEventListener('click', () => {
      userRating = index + 1; // index is 0-based, rating is 1-5
      updateStarDisplay(userRating);
      showToast(`You rated ${userRating} star${userRating > 1 ? 's' : ''}`, 'info');
    });
  });

  // Helper: visually update stars based on a rating number
  function updateStarDisplay(rating) {
    stars.forEach((s, i) => {
      s.style.filter  = i < rating ? 'none'        : 'grayscale(1)';
      s.style.opacity = i < rating ? '1'           : '0.3';
    });
  }

  // Handle case when mouse leaves the whole star group
  const starPicker = document.querySelector('.star-picker');
  if (starPicker) {
    starPicker.addEventListener('mouseleave', () => {
      updateStarDisplay(userRating);
    });
  }


  // ── SUBMIT REVIEW ────────────────────────────────────────────
  // When the form is submitted:
  // 1. Validate — name and review text are required
  // 2. Build a review card with the submitted data
  // 3. Add it to the top of the reviews feed
  // 4. Save to localStorage so it survives page refresh
  // 5. Clear the form

  const submitBtn = document.querySelector('.form-body .submit-btn');

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {

      // Get field values
      const nameInput     = document.querySelector('.form-body input[placeholder*="appear"]');
      const locationInput = document.querySelector('.form-body input[placeholder*="City"]');
      const typeSelect    = document.querySelector('.form-body select');
      const reviewText    = document.querySelector('.form-body textarea');

      const name     = nameInput     ? nameInput.value.trim()     : '';
      const location = locationInput ? locationInput.value.trim() : '';
      const type     = typeSelect    ? typeSelect.value           : '';
      const text     = reviewText    ? reviewText.value.trim()    : '';

      // Validate
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

      // Build star string based on rating
      const starStr = '⭐'.repeat(userRating);

      // Get today's date formatted nicely
      const today = new Date().toLocaleDateString('en-IN', {
        day:'numeric', month:'short', year:'numeric'
      });

      // Map type to pill class
      const pillMap = {
        'UI / Design':       { cls:'cat-ui',      label:'UI / Design'    },
        'Feature Request':   { cls:'cat-feature',  label:'Feature Request'},
        'Bug Report':        { cls:'cat-bug',      label:'Bug Report'     },
        'Content Feedback':  { cls:'cat-content',  label:'Content'        },
        'General Review':    { cls:'cat-general',  label:'General'        },
      };
      const pill = pillMap[type] || { cls:'cat-general', label:'General' };

      // Pick avatar color based on first letter of name
      const avatarColors = ['av-green','av-blue','av-red','av-purple','av-gold','av-ink'];
      const colorIndex   = name.charCodeAt(0) % avatarColors.length;
      const avatarClass  = avatarColors[colorIndex];

      // Get initials (first letter of first and last word)
      const parts    = name.toUpperCase().split(' ');
      const initials = parts.length >= 2
        ? parts[0][0] + parts[parts.length-1][0]
        : parts[0].substring(0,2);

      // Build the review card HTML
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

      // Insert after the pinned card (or at top of feed)
      if (firstCard && firstCard.nextSibling) {
        feed.insertBefore(newCard, firstCard.nextSibling);
      } else if (firstCard) {
        feed.appendChild(newCard);
      }

      // Attach helpful button handler to new card immediately
      attachHelpfulBtn(newCard.querySelector('.helpful-btn'));

      // Save to localStorage
      const savedReviews = JSON.parse(localStorage.getItem('yl_reviews')) || [];
      savedReviews.unshift({ name, location, type, text, rating:userRating, date:today });
      localStorage.setItem('yl_reviews', JSON.stringify(savedReviews));

      // Clear the form
      if (nameInput)     nameInput.value     = '';
      if (locationInput) locationInput.value = '';
      if (typeSelect)    typeSelect.value    = 'Select type';
      if (reviewText)    reviewText.value    = '';
      userRating = 0;
      updateStarDisplay(0);

      // Scroll to the new review
      newCard.scrollIntoView({ behavior:'smooth', block:'center' });
      showToast('Review posted! Thank you. ✓', 'success');
    });
  }


  // ── HELPFUL BUTTON ───────────────────────────────────────────
  // Clicking "Helpful" increments the count once per session.
  // We use a Set to track which buttons have been clicked.

  const clickedHelpful = new Set(
    JSON.parse(sessionStorage.getItem('yl_helpful')) || []
  );

  function attachHelpfulBtn(btn) {
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Get a unique ID for this button (position in DOM)
      const btnId = btn.closest('.review-card, .pinned-card')
        ?.querySelector('.user-name')?.textContent || btn.textContent;

      if (clickedHelpful.has(btnId)) {
        showToast('You already marked this as helpful.', 'info');
        return;
      }

      // Increment count
      const current = parseInt(btn.dataset.count) || 0;
      const next    = current + 1;
      btn.dataset.count  = next;
      btn.textContent    = `👍 Helpful (${next})`;
      btn.style.color    = 'var(--green)';
      btn.style.borderColor = 'var(--green-mid)';

      // Remember this click for the session
      clickedHelpful.add(btnId);
      sessionStorage.setItem('yl_helpful', JSON.stringify([...clickedHelpful]));

      showToast('Marked as helpful!', 'success');
    });
  }

  // Attach to all existing helpful buttons on the page
  document.querySelectorAll('.helpful-btn').forEach(btn => {
    // Extract the count from "Helpful (47)" → 47
    const match = btn.textContent.match(/\((\d+)\)/);
    if (match) btn.dataset.count = match[1];
    attachHelpfulBtn(btn);
  });


  // ── LOAD SAVED REVIEWS ON PAGE OPEN ──────────────────────────
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

}); // end DOMContentLoaded
