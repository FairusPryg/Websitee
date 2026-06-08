/* =============================================
   PORTFOLIO JS — FAIRUSPRIYOGI
   Smooth animations, interactions & effects
   ============================================= */

'use strict';

// ---- DOM READY ----
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initNavbar();
  initMobileMenu();
  initTypingEffect();
  initParticles();
  initScrollAnimations();
  initSkillBars();
  initContactForm();
  initBackToTop();
  initFooterYear();
  initSmoothScroll();
  initHeroParallax();
});

/* ==========================================
   1. PRELOADER
   ========================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Minimum display time for UX
  setTimeout(() => {
    preloader.classList.add('hidden');
    // Re-enable body scroll after preloader
    document.body.style.overflow = '';
    // Trigger hero animations
    document.querySelectorAll('.hero-content > *').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.1}s`;
    });
  }, 2000);

  document.body.style.overflow = 'hidden';
}

/* ==========================================
   2. CUSTOM CURSOR
   ========================================== */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower animation using rAF
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Scale on hover interactive elements
  const interactables = document.querySelectorAll('a, button, input, textarea, .hobby-card, .skill-icon-item, .edu-card, .timeline-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.4)';
      follower.style.width  = '56px';
      follower.style.height = '56px';
      follower.style.borderColor = 'rgba(168,85,247,0.6)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      follower.style.width  = '36px';
      follower.style.height = '36px';
      follower.style.borderColor = 'rgba(168,85,247,0.2)';
    });
  });

  // Hide on leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });
}

/* ==========================================
   3. NAVBAR — scroll & active link
   ========================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateNavbar() {
    const scrollY = window.scrollY;

    // Sticky effect
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
}

/* ==========================================
   4. MOBILE HAMBURGER MENU
   ========================================== */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;



  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeBtn.addEventListener('click', closeMenu);

  // Close on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMenu();
    }
  });
}

/* ==========================================
   5. TYPING / ROLE ROTATION EFFECT
   ========================================== */
function initTypingEffect() {
  const roleEl = document.getElementById('roleText');
  if (!roleEl) return;

  const roles = [
    'Full-Stack Developer',
    'System Architect',
    'AI & Prompt Engineer',
    'Database & API Integrator',
    'Full-Lifecycle Developer',
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function typeLoop() {
    const current = roles[roleIndex];

    if (!isDeleting) {
      roleEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          isDeleting = true;
          typeLoop();
        }, 2200);
        return;
      }
    } else {
      roleEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    if (!isPaused) {
      const speed = isDeleting ? 60 : 100;
      setTimeout(typeLoop, speed);
    }
  }

  // Blinking cursor via CSS class
  roleEl.style.borderRight = '2px solid #c084fc';
  roleEl.style.paddingRight = '4px';
  roleEl.style.animation = 'blink 1s step-end infinite';

  setTimeout(typeLoop, 1000);
}

/* ==========================================
   6. HERO PARTICLES
   ========================================== */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = window.innerWidth > 768 ? 55 : 25;

  for (let i = 0; i < count; i++) {
    createParticle(container);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  const size = Math.random() * 3 + 1;
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const duration = Math.random() * 20 + 15;
  const delay = Math.random() * 10;
  const opacity = Math.random() * 0.5 + 0.1;

  particle.style.cssText = `
    position: absolute;
    left: ${x}%;
    top: ${y}%;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${Math.random() > 0.5 ? '#7c3aed' : '#a855f7'};
    opacity: ${opacity};
    animation: particleFloat ${duration}s ${delay}s ease-in-out infinite;
    pointer-events: none;
  `;

  container.appendChild(particle);
}

// Inject particle keyframes
const particleStyle = document.createElement('style');
particleStyle.textContent = `
  @keyframes particleFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: var(--op, 0.3); }
    33%  { transform: translateY(-40px) translateX(20px) scale(1.2); }
    66%  { transform: translateY(-20px) translateX(-15px) scale(0.8); }
  }
`;
document.head.appendChild(particleStyle);

/* ==========================================
   7. SCROLL-TRIGGERED ANIMATIONS (AOS-like)
   ========================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-aos]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animated');
        // Once triggered, no need to observe again
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px',
  });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================
   8. SKILL BARS ANIMATION
   ========================================== */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.dataset.width;
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

/* ==========================================
   9. CONTACT FORM
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('nameInput')?.value.trim();
    const email   = document.getElementById('emailInput')?.value.trim();
    const message = document.getElementById('messageInput')?.value.trim();

    if (!name || !email || !message) {
      shakeForm(form);
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';

    // Simulate async send (replace with actual API call)
    setTimeout(() => {
      submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
      submitBtn.disabled = false;

      form.reset();

      // Show success
      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }
    }, 1800);
  });

  // Real-time input animations
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.style.transform = 'scale(1.01)';
    });
    input.addEventListener('blur', () => {
      input.parentElement.style.transform = '';
    });
  });
}

function shakeForm(form) {
  form.style.animation = 'shake 0.5s ease';
  setTimeout(() => form.style.animation = '', 500);
}

// Inject shake keyframe
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ==========================================
   10. BACK TO TOP BUTTON
   ========================================== */
function initBackToTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================
   11. FOOTER YEAR
   ========================================== */
function initFooterYear() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ==========================================
   12. SMOOTH SCROLL (enhanced)
   ========================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ==========================================
   13. HERO PARALLAX on Mouse Move
   ========================================== */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  const blobs = document.querySelectorAll('.blob');
  const photoFrame = document.querySelector('.photo-frame');

  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 20;
      blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });

    if (photoFrame) {
      photoFrame.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
    }
  });

  hero.addEventListener('mouseleave', () => {
    blobs.forEach(blob => {
      blob.style.transform = '';
    });
    if (photoFrame) {
      photoFrame.style.transform = '';
    }
  });
}

/* ==========================================
   14. CARD TILT EFFECT on Skills/Edu/Contact
   ========================================== */
document.querySelectorAll('.edu-card, .skills-block, .timeline-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease';
  });
});

/* ==========================================
   15. NUMBER COUNTER ANIMATION (Stats)
   ========================================== */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 25);
}

function initCounters() {
  const stats = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const match = text.match(/(\d+\.?\d*)([K+]*)/);
        if (match) {
          let value = parseFloat(match[1]);
          const suf = match[2] || '';

          if (suf.includes('K')) {
            // For "1.5K" etc., animate raw then format
            let raw = value * 10;
            let count = 0;
            const t = setInterval(() => {
              count = Math.min(count + 1, raw);
              el.textContent = (count / 10).toFixed(count % 10 === 0 ? 0 : 1) + 'K';
              if (count >= raw) clearInterval(t);
            }, 30);
          } else {
            animateCounter(el, Math.round(value), suf);
          }
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
}
initCounters();

/* ==========================================
   16. NAVBAR HIDE ON DOWN / SHOW ON UP
       (Optional UX enhancement)
   ========================================== */
let lastScrollY = 0;
let scrollTimeout;
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  clearTimeout(scrollTimeout);
  const currentScrollY = window.scrollY;

  // Only hide if scrolled past 200px and going down
  if (currentScrollY > 200 && currentScrollY > lastScrollY + 5) {
    navbar.style.transform = 'translateY(-100%)';
  } else if (currentScrollY < lastScrollY - 5) {
    navbar.style.transform = 'translateY(0)';
  }

  navbar.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s, padding 0.4s, box-shadow 0.4s';
  lastScrollY = currentScrollY;

  // Always show when near top
  if (currentScrollY < 100) {
    navbar.style.transform = 'translateY(0)';
  }
}, { passive: true });

/* ==========================================
   17. SECTION REVEAL INDICATOR
       Glowing line on section entry
   ========================================== */
function addSectionGlowLines() {
  document.querySelectorAll('.section').forEach(section => {
    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #7c3aed, #a855f7);
      border-radius: 3px;
      box-shadow: 0 0 12px rgba(124,58,237,0.6);
    `;
    section.style.position = 'relative';
    section.prepend(line);
  });
}
addSectionGlowLines();

/* ==========================================
   18. RIPPLE EFFECT on Buttons
   ========================================== */
document.querySelectorAll('.btn-primary, .btn-ghost, .social-btn, .social-link').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size   = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      transform: scale(0);
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
    `;

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Ripple keyframe
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleEffect {
    to { transform: scale(4); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

/* ==========================================
   19. HOBBY CARD EXTRA ANIMATION
   ========================================== */
document.querySelectorAll('.hobby-card').forEach((card, i) => {
  card.style.animationDelay = `${i * 0.15}s`;
  card.addEventListener('mouseenter', () => {
    const icon = card.querySelector('.hobby-icon');
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
      icon.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    }
  });
  card.addEventListener('mouseleave', () => {
    const icon = card.querySelector('.hobby-icon');
    if (icon) {
      icon.style.transform = '';
    }
  });
});

/* ==========================================
   20. ACTIVE SECTION PROGRESS INDICATOR
       (thin bar at top of viewport)
   ========================================== */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #7c3aed, #a855f7, #c084fc);
    z-index: 9998;
    transition: width 0.1s ease;
    box-shadow: 0 0 10px rgba(168,85,247,0.6);
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = progress + '%';
  }, { passive: true });
}
initScrollProgress();

console.log('%c✨ Portfolio loaded! Customize your data in index.html', 'color:#a855f7; font-weight:bold; font-size:14px;');
