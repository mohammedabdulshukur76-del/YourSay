// ============================================================
//  YourSay — app.js  (runs on EVERY page)
//  Fixed: hamburger double-trigger, nav button, active link
// ============================================================


// ── 1. HAMBURGER MENU FIX ─────────────────────────────────────
// THE BUG: Every HTML file has onclick="..." on the hamburger
// button. When app.js ALSO adds addEventListener, both fire
// together — the menu opens then immediately closes.
// THE FIX: We remove the inline onclick first, then add our own.

const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {

  // Remove the inline onclick that was causing the double-trigger
  hamburger.removeAttribute('onclick');

  // Now add our own single click handler
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('is-open', isOpen);
  });

  // Close drawer when any link inside it is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('is-open');
    });
  });

  // Close if user taps anywhere outside the nav/hamburger
  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('is-open');
    }
  });
}

// Hamburger lines → X animation (injected once for all pages)
const style = document.createElement('style');
style.textContent = `
  .hamburger span { transition: all 0.22s ease; }
  .hamburger.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
`;
document.head.appendChild(style);


// ── 2. ACTIVE NAV LINK ───────────────────────────────────────
// Automatically highlights the correct nav link
// based on which page you're currently on.
// This means you don't need class="active" in every HTML file.

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  link.classList.remove('active');
  const href = link.getAttribute('href');

  if (href === currentPage) {
    link.classList.add('active');
  }

  // Handle root / index.html
  if (
    (currentPage === '' || currentPage === 'index.html') &&
    (href === 'index.html' || href === './' || href === '/')
  ) {
    link.classList.add('active');
  }
});


// ── 3. NAV "RAISE ISSUE" BUTTON ──────────────────────────────
// THE BUG: The "+ Raise Issue" button in the nav did nothing.
// THE FIX: If we're already on issues.html, scroll to the form.
//          If we're on any other page, go to issues.html.

document.querySelectorAll('.nav-btn').forEach(btn => {
  if (btn.textContent.trim().includes('Raise')) {
    btn.addEventListener('click', () => {
      if (currentPage === 'issues.html') {
        // Already on issues page — scroll to the raise form
        const form = document.querySelector('.raise-section');
        if (form) form.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Go to issues page
        window.location.href = 'issues.html';
      }
    });
  }
});

// Same fix for the mobile nav "+ Raise Issue" button
document.querySelectorAll('.mobile-nav .mob-btn').forEach(btn => {
  if (btn.textContent.trim().includes('Raise')) {
    btn.removeAttribute('href');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      mobileNav && mobileNav.classList.remove('open');
      hamburger && hamburger.classList.remove('is-open');

      if (currentPage === 'issues.html') {
        const form = document.querySelector('.raise-section');
        if (form) form.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'issues.html';
      }
    });
  }
});


// ── 4. TOAST NOTIFICATION SYSTEM ─────────────────────────────
// Call showToast("message", "success") from any page.
// Types: "success", "error", "info", "warning"

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
toastContainer.style.cssText = `
  position:fixed; bottom:24px; right:24px; z-index:9999;
  display:flex; flex-direction:column; gap:8px; pointer-events:none;
`;
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
  const palette = {
    success: { bg:'#edf7f1', border:'#c2e8d0', color:'#1a7a44', icon:'✅' },
    error:   { bg:'#fdf0ee', border:'#f5c6c2', color:'#c0392b', icon:'❌' },
    info:    { bg:'#e8f0fb', border:'#b8d0f0', color:'#1a5fa8', icon:'ℹ️'  },
    warning: { bg:'#fdf5e0', border:'#f0dea0', color:'#b07d1a', icon:'⚠️'  },
  };
  const p = palette[type] || palette.success;
  const t = document.createElement('div');
  t.style.cssText = `
    background:${p.bg}; border:1.5px solid ${p.border}; color:${p.color};
    padding:12px 16px; border-radius:10px;
    font-family:'Epilogue',sans-serif; font-size:.875rem; font-weight:500;
    display:flex; align-items:center; gap:8px;
    min-width:220px; max-width:300px;
    box-shadow:0 4px 16px rgba(0,0,0,.08);
    pointer-events:all;
    opacity:0; transform:translateY(8px);
    transition:all .25s ease;
  `;
  t.innerHTML = `<span>${p.icon}</span><span>${message}</span>`;
  toastContainer.appendChild(t);
  setTimeout(() => { t.style.opacity='1'; t.style.transform='translateY(0)'; }, 10);
  setTimeout(() => {
    t.style.opacity='0'; t.style.transform='translateY(8px)';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}
