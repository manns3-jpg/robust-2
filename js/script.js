/* ============================================================
   RIAPL – Advanced Animation & Interaction Script
   Robust Investments Advisory Pvt. Ltd.
============================================================ */

'use strict';

/* ── Utility ─────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Page Transition Overlay ─────────────────────────────── */
function initPageTransition() {
    // Inject overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.prepend(overlay);

    // Remove after animation
    overlay.addEventListener('animationend', () => overlay.remove());

    // Intercept internal links for smooth exit
    qsa('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
            href.startsWith('tel:') || href.startsWith('http') ||
            link.target === '_blank') return;

        link.addEventListener('click', e => {
            e.preventDefault();
            const exitOverlay = document.createElement('div');
            exitOverlay.style.cssText = `
                position:fixed;inset:0;background:var(--primary-dark);
                z-index:99990;transform-origin:bottom;transform:scaleY(0);
                transition:transform 0.5s cubic-bezier(0.77,0,0.175,1);
            `;
            document.body.appendChild(exitOverlay);
            requestAnimationFrame(() => {
                exitOverlay.style.transform = 'scaleY(1)';
            });
            setTimeout(() => { window.location.href = href; }, 520);
        });
    });
}

/* ── Scroll Progress Bar ─────────────────────────────────── */
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
        const scrollTop  = window.scrollY;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width  = pct + '%';
    }, { passive: true });
}

/* ── Header Scroll Effect ────────────────────────────────── */
function initHeader() {
    const header = qs('#header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        // Just add shadow/bg when scrolled — sticky handles the rest
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}

/* ── Mobile Menu ─────────────────────────────────────────── */
function initMobileMenu() {
    const toggle   = qs('.menu-toggle');
    const navLinks = qs('.nav-links');
    if (!toggle || !navLinks) return;

    let isOpen = false;

    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        toggle.classList.toggle('active', isOpen);
        navLinks.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    qsa('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            isOpen = false;
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (isOpen && !e.target.closest('nav')) {
            isOpen = false;
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ── Smooth Scroll for Anchors ───────────────────────────── */
function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = qs(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const headerH = qs('#header')?.offsetHeight ?? 80;
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* ── Scroll Reveal (IntersectionObserver) ────────────────── */
function initScrollReveal() {
    // Auto-tag elements
    const serviceCards = qsa('.service-card');
    serviceCards.forEach((el, i) => {
        el.classList.add('reveal-up', `stagger-${(i % 6) + 1}`);
    });

    const featureCards = qsa('.feature-card');
    featureCards.forEach((el, i) => {
        el.classList.add('reveal-left', `stagger-${(i % 6) + 1}`);
    });

    const testimonialCards = qsa('.testimonial-card');
    testimonialCards.forEach((el, i) => {
        el.classList.add('reveal-scale', `stagger-${(i % 3) + 1}`);
    });

    const steps = qsa('.step');
    steps.forEach((el, i) => {
        el.classList.add('reveal-up', `stagger-${i + 1}`);
    });

    const sectionHeaders = qsa('.section-header');
    sectionHeaders.forEach(el => el.classList.add('reveal-up'));

    const valueCards = qsa('.value-card');
    valueCards.forEach((el, i) => {
        el.classList.add('reveal-scale', `stagger-${(i % 5) + 1}`);
    });

    const faqItems = qsa('.faq-item');
    faqItems.forEach((el, i) => {
        el.classList.add('reveal-up', `stagger-${(i % 4) + 1}`);
    });

    const ctaBox = qs('.cta-box');
    if (ctaBox) ctaBox.classList.add('reveal-scale');

    // Observe all reveal elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    qsa('.reveal-up, .reveal-left, .reveal-scale').forEach(el => observer.observe(el));
}

/* ── Animated Number Counter ─────────────────────────────── */
function animateCounter(el, target, duration = 2000, suffix = '') {
    const start      = performance.now();
    const isDecimal  = target % 1 !== 0;
    const startVal   = 0;

    function update(time) {
        const elapsed  = time - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = startVal + (target - startVal) * ease;
        el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target + suffix;
    }

    requestAnimationFrame(update);
}

function initCounters() {
    const statItems = qsa('.stat-item');
    if (!statItems.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);

            const h3 = qs('h3', entry.target);
            if (!h3) return;

            const raw     = h3.textContent.trim();
            const numMatch = raw.match(/[\d.]+/);
            if (!numMatch) return;

            const num    = parseFloat(numMatch[0]);
            const suffix = raw.replace(numMatch[0], '');
            h3.textContent = '0' + suffix;

            setTimeout(() => animateCounter(h3, num, 2200, suffix), 100);
        });
    }, { threshold: 0.5 });

    statItems.forEach(el => observer.observe(el));
}

/* ── FAQ Accordion ───────────────────────────────────────── */
function initFAQ() {
    const items = qsa('.faq-item');
    if (!items.length) return;

    // Wrap SVG in icon wrapper for the + animation
    items.forEach(item => {
        const btn = qs('.faq-question', item);
        const svg = btn?.querySelector('svg');
        if (!svg) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'faq-icon-wrapper';
        svg.replaceWith(wrapper);
        wrapper.appendChild(svg);
    });

    items.forEach(item => {
        const btn    = qs('.faq-question', item);
        const answer = qs('.faq-answer', item);
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Close all
            items.forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    qs('.faq-answer', other).style.maxHeight = null;
                }
            });

            // Toggle current
            item.classList.toggle('active', !isOpen);
            answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
        });
    });
}

/* ── Floating Cards Parallax on Hero ─────────────────────── */
function initHeroParallax() {
    const cards = qsa('.floating-card');
    if (!cards.length || window.innerWidth <= 768) return;

    document.addEventListener('mousemove', e => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        cards.forEach((card, i) => {
            const depth = (i + 1) * 6;
            const tx = dx * depth;
            const ty = dy * depth;
            card.style.transform = `translate(${tx}px, ${ty}px)`;
        });
    });
}

/* ── Service Cards – Shine Effect ───────────────────────── */
function initShineEffect() {
    qsa('.service-card').forEach(card => {
        // Add shine element
        const shine = document.createElement('div');
        shine.className = 'shine';
        card.appendChild(shine);
    });
}

/* ── Back to Top Button ──────────────────────────────────── */
function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>`;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ── Hero Orbs (injected dynamically) ────────────────────── */
function initHeroOrbs() {
    const hero = qs('.hero');
    if (!hero) return;

    [1, 2, 3].forEach(n => {
        const orb = document.createElement('div');
        orb.className = `hero-orb hero-orb-${n}`;
        hero.appendChild(orb);
    });
}

/* ── Tilt Effect on Feature Cards ───────────────────────── */
function initTiltEffect() {
    if (window.innerWidth <= 768) return;

    qsa('.service-card, .testimonial-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect   = card.getBoundingClientRect();
            const cx     = rect.left + rect.width / 2;
            const cy     = rect.top  + rect.height / 2;
            const dx     = (e.clientX - cx) / (rect.width / 2);
            const dy     = (e.clientY - cy) / (rect.height / 2);
            const tiltX  = dy * -5;
            const tiltY  = dx * 5;
            card.style.transform = `translateY(-10px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* ── Magnetic Button Effect ─────────────────────────────── */
function initMagneticButtons() {
    if (window.innerWidth <= 768) return;

    qsa('.btn-primary.btn-large, .btn-outline.btn-large').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx   = rect.left + rect.width / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) * 0.25;
            const dy   = (e.clientY - cy) * 0.25;
            btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-3px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

/* ── Contact Form: Floating Labels & Submit Feedback ─────── */
function initContactForm() {
    const form = qs('.contact-form');
    if (!form) return;

    // Animated label movement
    qsa('.form-group input, .form-group textarea, .form-group select').forEach(input => {
        const label = input.previousElementSibling;
        if (!label || label.tagName !== 'LABEL') return;

        input.addEventListener('focus', () => {
            label.style.color = 'var(--primary-blue)';
        });

        input.addEventListener('blur', () => {
            label.style.color = '';
        });
    });

    // Submit handler with visual feedback
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = qs('[type="submit"]', form);
        if (!btn) return;

        const original = btn.innerHTML;
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Sending...`;
        btn.disabled = true;
        btn.style.opacity = '0.8';

        await new Promise(r => setTimeout(r, 1800));

        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Message Sent!`;
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        btn.style.opacity = '1';

        setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            btn.style.background = '';
            btn.style.opacity = '';
            form.reset();
        }, 3000);
    });
}

/* ── Typewriter Subtitle (optional enhancement) ─────────── */
function initTypewriter() {
    const el = qs('.hero-text .section-tag, .hero .section-tag');
    // Skipped for hero – the gold shimmer title is the focal animation.
    // Available for future use if a `.typewrite` class is added.
}

/* ── Stats Bar Reveal ────────────────────────────────────── */
function initStatsReveal() {
    const statsBar = qs('.stats-bar');
    if (!statsBar) return;

    const items = qsa('.stat-item', statsBar);
    items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`;
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                items.forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(statsBar);
}

/* ── Add ripple effect to buttons ────────────────────────── */
function initRipple() {
    qsa('.btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position:absolute;
                border-radius:50%;
                background:rgba(255,255,255,0.35);
                width:10px;height:10px;
                left:${x - 5}px;top:${y - 5}px;
                pointer-events:none;
                transform:scale(0);
                animation:rippleEffect 0.6s ease-out forwards;
            `;

            // Inject @keyframes once
            if (!qs('#ripple-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-style';
                style.textContent = `
                    @keyframes rippleEffect {
                        to { transform: scale(25); opacity: 0; }
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            btn.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });
}

/* ── AOS (Animate On Scroll) init ────────────────────────── */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 750,
            easing: 'ease-out-cubic',
            once: true,
            offset: 60,
        });
    }
}

/* ── Active Nav Link Detection ───────────────────────────── */
function initActiveNav() {
    const path = window.location.pathname;
    qsa('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href') || '';
        if (href === '#') return;
        if (
            path.endsWith(href) ||
            (href === 'index.html' && (path === '/' || path.endsWith('/'))) ||
            (href !== 'index.html' && path.includes(href.replace('../', '').replace('.html', '')))
        ) {
            link.classList.add('active');
        }
    });
}

/* ── Spotlight effect on Why Us section ─────────────────── */
function initSpotlight() {
    const whyUs = qs('.why-us');
    if (!whyUs || window.innerWidth <= 768) return;

    whyUs.addEventListener('mousemove', e => {
        const rect = whyUs.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        whyUs.style.setProperty('--mx', x + '%');
        whyUs.style.setProperty('--my', y + '%');
    });
}

/* ── Particle burst on hero CTA click ───────────────────── */
function initHeroCTAEffect() {
    const cta = qs('.hero .btn-primary');
    if (!cta) return;

    cta.addEventListener('click', () => {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('span');
            const angle = (i / 8) * 360;
            const distance = 60 + Math.random() * 40;
            const tx = Math.cos((angle * Math.PI) / 180) * distance;
            const ty = Math.sin((angle * Math.PI) / 180) * distance;
            const size = 4 + Math.random() * 4;

            particle.style.cssText = `
                position:fixed;
                width:${size}px;height:${size}px;
                background:var(--accent-gold);
                border-radius:50%;
                pointer-events:none;
                z-index:99999;
                left:${cta.getBoundingClientRect().left + cta.offsetWidth/2}px;
                top:${cta.getBoundingClientRect().top + cta.offsetHeight/2}px;
                transition:transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.6s ease;
                transform:translate(-50%,-50%);
                opacity:1;
            `;

            document.body.appendChild(particle);

            requestAnimationFrame(() => {
                particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
                particle.style.opacity = '0';
            });

            setTimeout(() => particle.remove(), 700);
        }
    });
}

/* ── Section tag hover pulse ────────────────────────────── */
function initSectionTagHover() {
    qsa('.section-tag').forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'scale(1.06)';
            tag.style.letterSpacing = '2px';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = '';
            tag.style.letterSpacing = '';
        });
    });
}

/* ── Main Init ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initPageTransition();
    initScrollProgress();
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initHeroOrbs();
    initScrollReveal();
    initCounters();
    initFAQ();
    initBackToTop();
    initShineEffect();
    initRipple();
    initContactForm();
    initAOS();
    initActiveNav();
    initSectionTagHover();
    initStatsReveal();

    // Deferred (non-blocking)
    requestIdleCallback(() => {
        initHeroParallax();
        initTiltEffect();
        initMagneticButtons();
        initSpotlight();
        initHeroCTAEffect();
    }, { timeout: 1000 });
});

/* ── Polyfill requestIdleCallback ───────────────────────── */
if (!window.requestIdleCallback) {
    window.requestIdleCallback = fn => setTimeout(fn, 100);
}