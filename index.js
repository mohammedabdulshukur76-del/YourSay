document.addEventListener('DOMContentLoaded', () => {
  const statValues = document.querySelectorAll('.stat-value');
  function animateCounter(el) {
    const originalText = el.textContent.trim();
    let targetNumber = 0;
    let prefix = '';
    let suffix = '';
    let isDecimal = false;
    let decimals = 0;

    if (originalText.includes('₹') && originalText.includes('L')) {
      prefix = '₹';
      suffix = 'L';
      const num = parseFloat(originalText.replace('₹','').replace('L',''));
      targetNumber = num;
      isDecimal = true;
      decimals = 1;

    } else if (originalText.includes('₹') && originalText.includes('Cr')) {
      prefix = '₹';
      suffix = 'Cr';
      targetNumber = parseFloat(originalText.replace('₹','').replace('Cr',''));
      isDecimal = true;
      decimals = 1;

    } else {
      targetNumber = parseInt(originalText.replace(/[^0-9]/g,'')) || 0;
    }

    if (targetNumber === 0) return; 
    const duration = 1800;   
    const fps      = 60;     
    const steps    = (duration / 1000) * fps;
    const increment= targetNumber / steps;

    let current = 0;
    let frame   = 0;

    const interval = setInterval(() => {
      frame++;
      current += increment;

      const progress   = frame / steps;
      const eased      = 1 - Math.pow(1 - progress, 3); 
      const display    = targetNumber * eased;

      let displayText;
      if (isDecimal) {
        displayText = prefix + display.toFixed(decimals) + suffix;
      } else {
        displayText = prefix + Math.floor(display).toLocaleString('en-IN') + suffix;
      }

      el.textContent = displayText;

      if (frame >= steps) {
        clearInterval(interval);
        el.textContent = originalText; 
      }
    }, 1000 / fps);
  }

  const statsSection = document.querySelector('.stats-row');

  if (statsSection && statValues.length > 0) {

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statValues.forEach(el => animateCounter(el));

          observer.unobserve(statsSection);
        }
      });
    }, {
      threshold: 0.3 
    });

    observer.observe(statsSection);
  }

  const balBar = document.querySelector('.bal-bar');
  if (balBar) {
    const targetWidth = balBar.style.width || '67%';
    balBar.style.width      = '0%';
    balBar.style.transition = 'width 1.4s ease';

    setTimeout(() => {
      balBar.style.width = targetWidth;
    }, 400); 
  }

  const savedCounts = JSON.parse(localStorage.getItem('yl_counts')) || {};

  document.querySelectorAll('.issue-row').forEach(row => {
    const voteEl = row.querySelector('.vote-count');
    const voteBtn= row.querySelector('.vote-btn');

    if (!voteEl) return;
    const rawText  = voteEl.textContent.replace(/[^0-9,]/g,'').replace(/,/g,'');
    const htmlCount= parseInt(rawText) || 0;

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

  document.querySelectorAll('.sec-link').forEach(link => {
    const text = link.textContent.toLowerCase();
    if (text.includes('view all') || text.includes('all →')) {
      if (link.closest('.sidebar') && link.getAttribute('href') !== 'transactions.html') {
        link.setAttribute('href', 'issues.html');
      }
    }
  });


}); 
