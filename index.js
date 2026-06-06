// ============================================================
//  YourSay — index.js  (runs only on index.html / homepage)
//  Step 5: Number counter animation + dynamic stats
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── NUMBER COUNTER ANIMATION ──────────────────────────────────
  // What's happening:
  // We find every stat number on the page and animate it
  // counting UP from 0 to its real value when the page loads.
  //
  // How it works:
  // 1. Read the real value from the HTML (e.g. "₹48.6L")
  // 2. Start at 0
  // 3. Use setInterval to increase the number little by little
  // 4. Stop when we reach the real value
  //
  // We use IntersectionObserver so the animation only starts
  // when the stats section scrolls into view — not immediately.
  // This means if someone scrolls down fast, they still see it.

  // All the stat elements we want to animate
  const statValues = document.querySelectorAll('.stat-value');

  // This function animates a single element
  function animateCounter(el) {

    // Get the original text so we know what to count to
    // e.g. "₹48.6L" or "142"
    const originalText = el.textContent.trim();

    // Parse the number from the text
    // We handle formats like: ₹48.6L, ₹31.2L, ₹17.4L, 142
    let targetNumber = 0;
    let prefix = '';
    let suffix = '';
    let isDecimal = false;
    let decimals = 0;

    if (originalText.includes('₹') && originalText.includes('L')) {
      // Format: ₹48.6L
      prefix = '₹';
      suffix = 'L';
      const num = parseFloat(originalText.replace('₹','').replace('L',''));
      targetNumber = num;
      isDecimal = true;
      decimals = 1;

    } else if (originalText.includes('₹') && originalText.includes('Cr')) {
      // Format: ₹1.5Cr
      prefix = '₹';
      suffix = 'Cr';
      targetNumber = parseFloat(originalText.replace('₹','').replace('Cr',''));
      isDecimal = true;
      decimals = 1;

    } else {
      // Format: plain number like 142
      targetNumber = parseInt(originalText.replace(/[^0-9]/g,'')) || 0;
    }

    if (targetNumber === 0) return; // nothing to animate

    // Animation settings
    const duration = 1800;   // total animation time in milliseconds
    const fps      = 60;     // frames per second
    const steps    = (duration / 1000) * fps;
    const increment= targetNumber / steps;

    let current = 0;
    let frame   = 0;

    // setInterval calls a function repeatedly every N milliseconds
    // 1000/fps = ~16ms per frame (60fps)
    const interval = setInterval(() => {
      frame++;
      current += increment;

      // Ease out — slow down near the end for a nice feel
      // This formula makes early frames faster, later frames slower
      const progress   = frame / steps;
      const eased      = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const display    = targetNumber * eased;

      // Format the number for display
      let displayText;
      if (isDecimal) {
        displayText = prefix + display.toFixed(decimals) + suffix;
      } else {
        displayText = prefix + Math.floor(display).toLocaleString('en-IN') + suffix;
      }

      el.textContent = displayText;

      // Stop when we reach the target
      if (frame >= steps) {
        clearInterval(interval);
        el.textContent = originalText; // snap to exact final value
      }
    }, 1000 / fps);
  }


  // ── INTERSECTION OBSERVER ────────────────────────────────────
  // IntersectionObserver watches elements and fires a callback
  // when they become visible in the viewport.
  // We use it so the counter starts when user sees the stats
  // — not before.

  const statsSection = document.querySelector('.stats-row');

  if (statsSection && statValues.length > 0) {

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stats section is now visible — start all counters
          statValues.forEach(el => animateCounter(el));

          // Stop observing after first trigger
          // (so animation doesn't replay on scroll)
          observer.unobserve(statsSection);
        }
      });
    }, {
      threshold: 0.3 // trigger when 30% of section is visible
    });

    observer.observe(statsSection);
  }


  // ── BALANCE BAR ANIMATION ────────────────────────────────────
  // Animate the balance bar from 0% to 67% when it loads.
  // Makes the progress bar feel alive instead of just appearing.

  const balBar = document.querySelector('.bal-bar');
  if (balBar) {
    const targetWidth = balBar.style.width || '67%';
    balBar.style.width      = '0%';
    balBar.style.transition = 'width 1.4s ease';

    setTimeout(() => {
      balBar.style.width = targetWidth;
    }, 400); // small delay so user notices it
  }


  // ── DYNAMIC ISSUE VOTE COUNTS (sidebar) ──────────────────────
  // The sidebar on the homepage shows "Top Issues" with vote counts.
  // If the user voted on those issues on the issues page,
  // let's show the updated counts here too.

  const savedCounts = JSON.parse(localStorage.getItem('yl_counts')) || {};

  document.querySelectorAll('.issue-row').forEach(row => {
    const voteEl = row.querySelector('.vote-count');
    const voteBtn= row.querySelector('.vote-btn');

    if (!voteEl) return;

    // We don't have issue IDs on the homepage sidebar cards,
    // so we read the current count text and use it as a key
    const rawText  = voteEl.textContent.replace(/[^0-9,]/g,'').replace(/,/g,'');
    const htmlCount= parseInt(rawText) || 0;

    // Animate sidebar vote counts too
    let count = htmlCount;
    let start = 0;
    const steps = 40;
    const inc   = count / steps;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / steps;
      const eased    = 1 - Math.pow(1 - progress, 3);
      const display  = Math.floor(count * eased);
      voteEl.textContent = `▲ ${display.toLocaleString('en-IN')} votes`;
      if (frame >= steps) {
        clearInterval(interval);
        voteEl.textContent = `▲ ${count.toLocaleString('en-IN')} votes`;
      }
    }, 16);

    // Vote button on sidebar
    if (voteBtn) {
      voteBtn.addEventListener('click', () => {
        count++;
        voteEl.textContent = `▲ ${count.toLocaleString('en-IN')} votes`;
        voteBtn.textContent   = '✓ Voted';
        voteBtn.disabled      = true;
        voteBtn.style.opacity = '0.55';
        voteBtn.style.background   = 'var(--green-light)';
        voteBtn.style.color        = 'var(--green)';
        voteBtn.style.borderColor  = 'var(--green-mid)';
        showToast('Vote counted! ▲', 'success');
      });
    }
  });


  // ── HERO BUTTON ACTIONS ──────────────────────────────────────
  // "View All Transactions" → goes to transactions.html
  // "Raise an Issue" → goes to issues.html

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


  // ── "VIEW ALL →" LINKS ───────────────────────────────────────
  // Connect the "View all →" links in the transactions and
  // issues sections to the right pages.

  document.querySelectorAll('.sec-link').forEach(link => {
    const text = link.textContent.toLowerCase();
    if (text.includes('view all') || text.includes('all →')) {
      if (link.closest('.sidebar') && link.getAttribute('href') !== 'transactions.html') {
        // issues sidebar link
        link.setAttribute('href', 'issues.html');
      }
    }
  });


}); // end DOMContentLoaded
