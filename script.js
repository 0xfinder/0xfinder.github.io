// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Theme toggle with persistence
const themeToggle = document.getElementById('themeToggle');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const savedTheme = localStorage.getItem('bh_theme');
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
}
applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('bh_theme', isLight ? 'light' : 'dark');
  });
}

// Smooth scroll for in-page links
const internalLinks = document.querySelectorAll('a[href^="#"]');
for (const link of internalLinks) {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const el = document.querySelector(targetId);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navList?.classList.remove('open');
    }
  });
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.1 });
for (const el of revealEls) observer.observe(el);

// Stat counters
const statNums = document.querySelectorAll('.stat .num');
for (const numEl of statNums) {
  const target = Number(numEl.dataset.target || '0');
  const durationMs = 1200;
  let startTs = 0;
  function step(ts) {
    if (!startTs) startTs = ts;
    const progress = Math.min((ts - startTs) / durationMs, 1);
    const value = Math.floor(progress * target);
    numEl.textContent = String(value);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Modal / Lightbox helpers
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
function openModal(html) {
  if (!modal || !modalBody) return;
  modalBody.innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  if (!modal || !modalBody) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
  document.body.style.overflow = '';
}
if (modal) {
  modal.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.hasAttribute('data-close')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

// Albums -> open embed in modal
const albumCards = document.querySelectorAll('.album-card');
for (const card of albumCards) {
  card.addEventListener('click', () => {
    try {
      const data = JSON.parse(card.getAttribute('data-album') || '{}');
      const title = data.title || 'Album';
      const year = data.year || '';
      const embed = data.embed ? `<iframe style="border-radius:12px" src="${data.embed}" width="100%" height="380" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>` : '';
      openModal(`
        <div class="card">
          <h3 style="margin-top:0">${title} <span class="alt-note">${year}</span></h3>
          ${embed || '<p>Tracklist preview not available.</p>'}
        </div>
      `);
    } catch (err) {
      console.error('Invalid album data', err);
    }
  });
}

// Gallery lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
for (const item of galleryItems) {
  item.addEventListener('click', () => {
    const src = item.getAttribute('data-src');
    if (!src) return;
    openModal(`
      <div style="padding:0">
        <img src="${src}" alt="Justin Bieber live photo" style="width:100%;height:auto;display:block;"/>
      </div>
    `);
  });
}

// Newsletter form
const form = document.getElementById('newsletterForm');
const formMsg = document.getElementById('formMsg');
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    if (!isValidEmail(email)) {
      if (formMsg) formMsg.textContent = 'Please enter a valid email address.';
      return;
    }
    const existing = JSON.parse(localStorage.getItem('bh_subscribers') || '[]');
    if (!existing.find((x) => x.email === email)) {
      existing.push({ name, email, t: Date.now() });
      localStorage.setItem('bh_subscribers', JSON.stringify(existing));
    }
    form.reset();
    if (formMsg) formMsg.textContent = `Thanks${name ? `, ${name}` : ''}! You are subscribed.`;
  });
}

// Back to top
const toTop = document.getElementById('backToTop');
function onScroll() {
  if (!toTop) return;
  if (window.scrollY > 400) toTop.classList.add('show'); else toTop.classList.remove('show');
}
window.addEventListener('scroll', onScroll);
onScroll();
if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
