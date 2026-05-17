  // ── Site Data — injection des dates et Breaking News depuis site-data.json
  (async function() {
    try {
      const res = await fetch('site-data.json');
      if (!res.ok) return;
      const data = await res.json();

      // Date de mise à jour du badge
      const timeEl = document.querySelector('.page-updated-bar time');
      if (timeEl && data.pages) {
        const slug = window.location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
        const page = data.pages[slug];
        if (page?.updated) timeEl.textContent = 'Updated: ' + page.updated;
      }

      // Breaking News (index.html uniquement)
      const bn = data.breakingNews;
      const bnEl = document.querySelector('.hero-breaking');
      if (bn && bnEl) {
        const linkEl = bnEl.closest('a');
        const numEl  = bnEl.querySelector('.hero-breaking-num');
        const textEl = bnEl.querySelector('.hero-breaking-text');
        const ctaEl  = bnEl.children[3];
        if (bn.active === false) { linkEl?.remove(); }
        else {
          if (numEl)  numEl.textContent = bn.ordinal;
          if (textEl) textEl.innerHTML  = bn.text + ' &nbsp;<span>' + bn.date + '</span>';
          if (ctaEl)  ctaEl.textContent = bn.cta;
          if (linkEl) linkEl.href       = bn.link;
        }
      }
    } catch(e) { /* site-data.json absent — valeurs HTML utilisées */ }
  })();

  // ── Page Updated Badge — déplacé dans la nav
  const updatedBar = document.querySelector('.page-updated-bar');
  const navEl = document.querySelector('nav');
  if (updatedBar && navEl) navEl.appendChild(updatedBar);

  // ── Sticky Nav
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── Animated Counter
  function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── Intersection Observer for fade-up + counters
  const fadeEls = document.querySelectorAll('.fade-up');
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => observer.observe(el));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  // ── Active nav section tracking
  (function() {
    const sections = ['home','disease','about','children','research','donate','contact'];
    const navLinks = {};
    sections.forEach(id => {
      const el = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (el) navLinks[id] = el;
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (navLinks[id]) {
          if (entry.isIntersecting) {
            Object.values(navLinks).forEach(a => a.classList.remove('nav-active'));
            navLinks[id].classList.add('nav-active');
          }
        }
      });
    }, { threshold: 0.25 });
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  })();

  // ── Hamburger menu toggle
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('nav-open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('nav-menu-open', isOpen);
    });
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-menu-open');
      });
    });
  }

  // ── Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
