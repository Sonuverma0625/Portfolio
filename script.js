const defaultConfig = {
  template_select: 'modern',
  brand_name: 'Darkside',
  hero_name: "Hi, I'm Sonu",
  hero_tagline: 'Full Stack Developer | C++ Programmer | AI/ML Enthusiast',
  intro_text: 'I am a passionate Full Stack Developer and B.Tech ECE student with strong skills in MERN Stack, C++, DSA, Python, MySQL, MongoDB, and AI/ML. I enjoy building modern, responsive, and user-friendly web applications that combine clean design with powerful functionality. My goal is to create real-world projects that solve problems and deliver smooth digital experiences.',
  about_text: 'I am Sonu, a Full Stack Developer, C++ Programmer, and AI/ML Enthusiast currently pursuing B.Tech in Electronics and Communication Engineering. I have experience in building responsive websites, full-stack applications, and interactive user interfaces using HTML, CSS, JavaScript, React, Node.js, Express.js, MongoDB, and MySQL.',
  resume_url: 'mailto:vermasonu0625144@gmail.com',
  background_color: '#0a0a0f',
  surface_color: '#1a1a2e',
  text_color: '#e8e4df',
  primary_action_color: '#ff6b35',
  secondary_action_color: '#a09a93',
  font_family: 'Syne',
  font_size: 16
};

function renderRunningTagline(text) {
  const tagline = document.getElementById('hero-tagline');
  if (!tagline) return;

  const parts = text.split('|').map(part => part.trim()).filter(Boolean);
  const track = document.createElement('div');
  track.className = 'running-tagline-track';
  tagline.setAttribute('aria-label', text);

  for (let repeat = 0; repeat < 2; repeat++) {
    parts.forEach((part, index) => {
      const span = document.createElement('span');
      span.textContent = part;
      if (repeat === 1) span.setAttribute('aria-hidden', 'true');
      track.appendChild(span);

      if (index < parts.length - 1) {
        const separator = document.createElement('b');
        separator.textContent = '|';
        separator.setAttribute('aria-hidden', 'true');
        track.appendChild(separator);
      }
    });
  }

  tagline.replaceChildren(track);
}

function applyConfig(config) {
  const c = { ...defaultConfig, ...config };
  const app = document.getElementById('app');
  
  // Remove all template classes
  app.classList.remove('template-modern', 'template-minimal', 'template-gradient', 'template-tech');
  
  // Apply selected template
  const template = c.template_select.toLowerCase().trim();
  if (template === 'minimal') app.classList.add('template-minimal');
  else if (template === 'gradient') app.classList.add('template-gradient');
  else if (template === 'tech') app.classList.add('template-tech');
  else app.classList.add('template-modern');
  
  document.getElementById('hero-name').textContent = c.hero_name;
  renderRunningTagline(c.hero_tagline);
  document.getElementById('about-text').textContent = c.about_text;
  document.getElementById('intro-text').textContent = c.intro_text;
  document.getElementById('nav-name').textContent = c.brand_name;

  const wrap = document.querySelector('.portfolio-wrap');
  wrap.style.background = c.background_color;
  wrap.style.color = c.text_color;
  wrap.style.fontFamily = `${c.font_family}, sans-serif`;
  wrap.style.fontSize = c.font_size + 'px';

  document.getElementById('hero-name').style.background = `linear-gradient(135deg, ${c.text_color} 40%, ${c.primary_action_color})`;
  document.getElementById('hero-name').style.webkitBackgroundClip = 'text';
  document.getElementById('hero-name').style.webkitTextFillColor = 'transparent';
  document.getElementById('hero-name').style.fontSize = `${c.font_size * 4.5}px`;
  document.getElementById('hero-tagline').style.fontSize = `${c.font_size * 1.4}px`;
  document.getElementById('hero-tagline').style.color = c.secondary_action_color;
  const resumeLink = document.getElementById('resume-link');
  if (resumeLink) resumeLink.href = c.resume_url;

  document.querySelectorAll('.section-title').forEach(el => el.style.color = c.primary_action_color);
  document.querySelectorAll('.skill-bar').forEach(el => el.style.background = `linear-gradient(90deg, ${c.primary_action_color}, #ff9f1c)`);
  document.querySelectorAll('.color-secondary').forEach(el => el.style.color = c.secondary_action_color);
  document.querySelectorAll('.bg-primary').forEach(el => { el.style.background = c.primary_action_color; });
}

function setupImageFallbacks() {
  document.querySelectorAll('img').forEach(img => {
    const markMissing = () => {
      const frame = img.closest('.media-frame, .hero-photo-container, .about-photo-card');
      if (frame) {
        frame.classList.add('image-missing');
        frame.setAttribute('data-label', img.alt || 'Image unavailable');
      }
      img.style.display = 'none';
    };

    img.addEventListener('error', markMissing, { once: true });
    if (img.complete && img.naturalWidth === 0) markMissing();
  });
}

const RESUME_DB_NAME = 'portfolio_resume_db';
const RESUME_STORE_NAME = 'resume_files';
const RESUME_KEY = 'current';
const RESUME_MAX_SIZE = 10 * 1024 * 1024;
const PERMANENT_RESUME = {
  name: 'sonuresume.pdf',
  size: 528867,
  updatedAt: '2026-06-11T21:48:55+05:30',
  url: 'resume/sonuresume.pdf',
  permanent: true
};
let activeResumeUrl = null;
let activeResumeIsObjectUrl = false;

function openResumeDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Resume storage is not available in this browser.'));
      return;
    }

    const request = indexedDB.open(RESUME_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(RESUME_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readResumeRecord() {
  const db = await openResumeDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUME_STORE_NAME, 'readonly');
    const request = transaction.objectStore(RESUME_STORE_NAME).get(RESUME_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => db.close();
  });
}

async function saveResumeRecord(record) {
  const db = await openResumeDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUME_STORE_NAME, 'readwrite');
    transaction.objectStore(RESUME_STORE_NAME).put(record, RESUME_KEY);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

async function deleteResumeRecord() {
  const db = await openResumeDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUME_STORE_NAME, 'readwrite');
    transaction.objectStore(RESUME_STORE_NAME).delete(RESUME_KEY);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

function formatResumeSize(bytes) {
  if (!bytes) return '--';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function getResumeToDisplay(record) {
  if (!record) return PERMANENT_RESUME;
  if (record.name === 'fullstackresume.pdf') return PERMANENT_RESUME;
  if (record.name === PERMANENT_RESUME.name && record.size === PERMANENT_RESUME.size) {
    return PERMANENT_RESUME;
  }
  return record;
}

function setupResumeUpload() {
  const input = document.getElementById('resume-file');
  const status = document.getElementById('resume-status');
  const nameEl = document.getElementById('resume-name');
  const sizeEl = document.getElementById('resume-size');
  const dateEl = document.getElementById('resume-date');
  const viewBtn = document.getElementById('resume-view');
  const downloadLink = document.getElementById('resume-download');
  const removeBtn = document.getElementById('resume-remove');
  if (!input || !status || !nameEl || !sizeEl || !dateEl || !viewBtn || !downloadLink || !removeBtn) return;

  const updateStatus = (message, type = '') => {
    status.textContent = message;
    status.className = type ? `resume-status ${type}` : 'resume-status';
  };

  const renderResume = (record, message, type) => {
    if (activeResumeUrl && activeResumeIsObjectUrl) URL.revokeObjectURL(activeResumeUrl);
    activeResumeUrl = null;
    activeResumeIsObjectUrl = false;

    if (!record) {
      nameEl.textContent = 'Waiting for upload';
      sizeEl.textContent = '--';
      dateEl.textContent = '--';
      viewBtn.disabled = true;
      removeBtn.disabled = true;
      downloadLink.hidden = true;
      downloadLink.removeAttribute('href');
      updateStatus(message || 'No resume uploaded yet.', type || '');
      return;
    }

    if (record.url) {
      activeResumeUrl = record.url;
    } else {
      activeResumeUrl = URL.createObjectURL(record.blob);
      activeResumeIsObjectUrl = true;
    }

    nameEl.textContent = record.name;
    sizeEl.textContent = formatResumeSize(record.size);
    dateEl.textContent = new Date(record.updatedAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    viewBtn.disabled = false;
    removeBtn.disabled = !!record.permanent;
    downloadLink.hidden = false;
    downloadLink.href = activeResumeUrl;
    downloadLink.download = record.name;
    updateStatus(message || (record.permanent ? 'Permanent resume is ready.' : 'Resume is ready.'), type || 'success');
  };

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const allowed = ['pdf', 'doc', 'docx'];
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(extension)) {
      updateStatus('Please upload a PDF, DOC, or DOCX resume.', 'error');
      input.value = '';
      return;
    }

    if (file.size > RESUME_MAX_SIZE) {
      updateStatus('Resume must be 10 MB or smaller.', 'error');
      input.value = '';
      return;
    }

    const record = {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      updatedAt: new Date().toISOString(),
      blob: file
    };

    try {
      await saveResumeRecord(record);
      renderResume(record, 'Resume uploaded successfully.', 'success');
    } catch (_) {
      updateStatus('Could not save resume in this browser. Please try again.', 'error');
    } finally {
      input.value = '';
    }
  });

  viewBtn.addEventListener('click', () => {
    if (activeResumeUrl) window.open(activeResumeUrl, '_blank', 'noopener');
  });

  removeBtn.addEventListener('click', async () => {
    try {
      await deleteResumeRecord();
      renderResume(PERMANENT_RESUME, 'Temporary resume removed. Permanent resume is active.', 'success');
    } catch (_) {
      updateStatus('Could not remove resume. Please try again.', 'error');
    }
  });

  readResumeRecord()
    .then(record => renderResume(getResumeToDisplay(record)))
    .catch(() => renderResume(PERMANENT_RESUME, 'Permanent resume is ready. Browser upload storage is unavailable.', 'success'));
}

function setupMobileNav() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  const icon = toggle.querySelector('i');
  const setOpen = (open) => {
    links.classList.toggle('is-open', open);
    document.body.classList.toggle('mobile-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (icon) icon.setAttribute('data-lucide', open ? 'x' : 'menu');
    if (window.lucide) lucide.createIcons();
  };

  toggle.addEventListener('click', () => {
    setOpen(!links.classList.contains('is-open'));
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 767) setOpen(false);
  });
}

// Apply default config on page load
document.addEventListener('DOMContentLoaded', () => {
  applyConfig(defaultConfig);
  setupImageFallbacks();
  setupResumeUpload();
  setupMobileNav();
});

// Custom cursor
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX - 6 + 'px';
  cursor.style.top = e.clientY - 6 + 'px';
});

// 3D tilt on project cards
document.querySelectorAll('.float-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateZ(20px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0) rotateX(0) translateZ(0) scale(1)';
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

lucide.createIcons();

// ── Contact Form ──────────────────────────────────────────────────────────────
const BACKEND_URL = '/api';

/**
 * Track a page visit to the backend analytics (silent, best-effort)
 */
async function trackVisit() {
  try {
    await fetch(`${BACKEND_URL}/analytics/visit`, { method: 'POST' });
  } catch (_) { /* offline – ignore */ }
}
trackVisit();

/**
 * Show status message inside the contact form
 * @param {'success'|'error'|'hide'} type
 * @param {string} message
 */
function showFormStatus(type, message) {
  const el = document.getElementById('cf-status');
  if (!el) return;
  if (type === 'hide') { el.style.display = 'none'; return; }
  el.className = `cf-status ${type}`;
  el.style.display = 'flex';
  el.textContent = type === 'success' ? 'Success: ' + message : 'Error: ' + message;
}

/**
 * Save message to localStorage as offline fallback
 */
function saveMessageLocally(payload) {
  const stored = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
  stored.push({
    id: `local-${Date.now()}`,
    ...payload,
    read: false,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('portfolio_messages', JSON.stringify(stored));
}

/**
 * Validate contact form fields — returns error string or null
 */
function validateForm(name, email, message) {
  if (!name.trim())    return 'Please enter your name.';
  if (!email.trim())   return 'Please enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  if (!message.trim()) return 'Please enter a message.';
  return null;
}

// Contact form submit handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl    = document.getElementById('cf-name');
    const emailEl   = document.getElementById('cf-email');
    const subjectEl = document.getElementById('cf-subject');
    const msgEl     = document.getElementById('cf-message');
    const submitBtn = document.getElementById('cf-submit');

    const name    = nameEl.value;
    const email   = emailEl.value;
    const subject = subjectEl ? subjectEl.value : '';
    const message = msgEl.value;

    // Clear previous error states
    [nameEl, emailEl, msgEl].forEach(el => el.classList.remove('error'));
    showFormStatus('hide', '');

    // Client-side validation
    const validationError = validateForm(name, email, message);
    if (validationError) {
      showFormStatus('error', validationError);
      if (!name.trim())    nameEl.classList.add('error');
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) emailEl.classList.add('error');
      if (!message.trim()) msgEl.classList.add('error');
      return;
    }

    const payload = { name, email, subject, message };

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span style="opacity:0.7">Sending...</span>';

    try {
      // Try backend API first
      const res = await fetch(`${BACKEND_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showFormStatus('success', data.message || 'Message sent! I\'ll get back to you soon.');
        contactForm.reset();
      } else {
        showFormStatus('error', data.error || 'Something went wrong. Please try again.');
      }
    } catch (_) {
      // Backend offline — save locally
      saveMessageLocally(payload);
      showFormStatus('success', 'Message saved! (Server offline - will sync when backend starts)');
      contactForm.reset();
    }

    // Restore button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send" class="icon-sm"></i><span>Send Message</span>';
    lucide.createIcons();
  });
}
