// nosotros.js — Animaciones para la página Sobre Nosotros

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Mobile menu ───────────────────────────────────────────────────────
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav    = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            mainNav.classList.toggle('open');
        });
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                mainNav.classList.remove('open');
            });
        });
    }

    // ─── 2. Scroll progress bar ───────────────────────────────────────────────
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
        if (progressBar) progressBar.style.width = `${pct}%`;
    }, { passive: true });

    // ─── 3. Header shadow on scroll ──────────────────────────────────────────
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 50
            ? '0 4px 24px rgba(26,39,68,0.12)' : 'none';
    }, { passive: true });

    // ─── 4. Hero particles ───────────────────────────────────────────────────
    const particleContainer = document.getElementById('hero-particles');
    if (particleContainer) {
        for (let i = 0; i < 22; i++) {
            const p        = document.createElement('div');
            p.className    = 'particle';
            const size     = Math.random() * 8 + 3;
            const left     = Math.random() * 100;
            const duration = Math.random() * 12 + 8;
            const delay    = Math.random() * 10;
            p.style.cssText = `
                width:${size}px; height:${size}px;
                left:${left}%;
                bottom:-${size}px;
                animation-duration:${duration}s;
                animation-delay:-${delay}s;
                opacity:${Math.random() * 0.4 + 0.1};
            `;
            particleContainer.appendChild(p);
        }
    }

    // ─── 5. Parallax en hero ─────────────────────────────────────────────────
    const hero = document.querySelector('.page-hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            hero.style.backgroundPositionY = `${window.scrollY * 0.35}px`;
        }, { passive: true });
    }

    // ─── 6. IntersectionObserver central ─────────────────────────────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    const revealMap = [
        { sel: '.profile-intro',       cls: 'up',    base: 0 },
        { sel: '.expertise-card',      cls: 'up',    base: 0,   stagger: 100 },
        { sel: '.profile-quote',       cls: 'blur',  base: 0 },
        { sel: '.notary-card',         cls: 'up',    base: 0,   stagger: 110 },
        { sel: '.notary-intro',        cls: 'blur',  base: 0 },
        { sel: '.value-item',          cls: 'up',    base: 0,   stagger: 90 },
        { sel: '.values-header',       cls: 'up',    base: 0 },
        { sel: '.cta-content h2',      cls: 'up',    base: 0 },
        { sel: '.cta-content p',       cls: 'blur',  base: 150 },
        { sel: '.cta-buttons',         cls: 'scale', base: 260 },
        { sel: '.process-header',      cls: 'blur',  base: 0 },
        { sel: '.timeline-header',     cls: 'blur',  base: 0 },
        { sel: '.testimonials-header', cls: 'blur',  base: 0 },
        { sel: '.faq-header',          cls: 'blur',  base: 0 },
        { sel: '.btn-primary',         cls: 'scale', base: 0 },
    ];

    revealMap.forEach(({ sel, cls, base, stagger }) => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('reveal', cls);
            el.style.transitionDelay = `${base + (stagger ? i * stagger : 0)}ms`;
            observer.observe(el);
        });
    });

    // ─── 7. Credential items reveal ──────────────────────────────────────────
    const credentialsCard = document.querySelector('.credentials-card');
    if (credentialsCard) {
        const credObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    credentialsCard.querySelectorAll('.credential-item').forEach(item => {
                        item.classList.add('animate-in');
                    });
                    credObs.unobserve(credentialsCard);
                }
            });
        }, { threshold: 0.4 });
        credObs.observe(credentialsCard);
    }

    // ─── 8. Profile badges reveal ────────────────────────────────────────────
    const badgesWrap = document.querySelector('.profile-badges');
    if (badgesWrap) {
        const badgeObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    badgesWrap.querySelectorAll('.profile-badge').forEach(b => b.classList.add('animate-in'));
                    badgeObs.unobserve(badgesWrap);
                }
            });
        }, { threshold: 0.5 });
        badgeObs.observe(badgesWrap);
    }

    // ─── 9. Stats counter animation ──────────────────────────────────────────
    const statObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                const numEl = entry.target.querySelector('.stat-number');
                if (numEl && !numEl.dataset.counted) {
                    numEl.dataset.counted = '1';
                    const target   = parseInt(numEl.dataset.target, 10);
                    const duration = 1600;
                    const start    = performance.now();

                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const ease     = 1 - Math.pow(1 - progress, 3);
                        numEl.textContent = Math.floor(ease * target);
                        if (progress < 1) requestAnimationFrame(tick);
                        else numEl.textContent = target;
                    };
                    requestAnimationFrame(tick);
                }
                statObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.stat-block').forEach(b => statObs.observe(b));

    // ─── 10. Process steps stagger ───────────────────────────────────────────
    const processObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.process-step').forEach(s => s.classList.add('animate-in'));
                processObs.disconnect();
            }
        });
    }, { threshold: 0.15 });

    const processSection = document.querySelector('.process-section');
    if (processSection) processObs.observe(processSection);

    // ─── 11. Timeline reveal ─────────────────────────────────────────────────
    const timelineObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const content = entry.target.querySelector('.timeline-content');
                const dot     = entry.target.querySelector('.timeline-dot:not(.timeline-dot--active)');
                if (content) setTimeout(() => content.classList.add('animate-in'), 150);
                if (dot)     { dot.style.background = 'var(--gold)'; dot.style.borderColor = 'var(--gold)'; }
                timelineObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.timeline-item').forEach((item, i) => {
        const content = item.querySelector('.timeline-content');
        if (content) content.style.transitionDelay = `${i * 80}ms`;
        timelineObs.observe(item);
    });

    // ─── 12. Testimonial cards reveal ────────────────────────────────────────
    const testObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.testimonial-card').forEach(c => c.classList.add('animate-in'));
                testObs.disconnect();
            }
        });
    }, { threshold: 0.15 });

    const testSection = document.querySelector('.testimonials-section');
    if (testSection) testObs.observe(testSection);

    // ─── 13. FAQ accordion ───────────────────────────────────────────────────
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    // FAQ items reveal
    const faqObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.faq-item').forEach(f => f.classList.add('animate-in'));
                faqObs.disconnect();
            }
        });
    }, { threshold: 0.1 });

    const faqSection = document.querySelector('.faq-section');
    if (faqSection) faqObs.observe(faqSection);

    // ─── 14. 3D tilt en notary cards ─────────────────────────────────────────
    document.querySelectorAll('.notary-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            card.style.transform = `translateY(-10px) scale(1.01) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ─── 15. 3D tilt en testimonial cards ────────────────────────────────────
    document.querySelectorAll('.testimonial-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            const baseY = card.classList.contains('testimonial-card--featured') ? -18 : -8;
            card.style.transform = `translateY(${baseY}px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ─── 16. Magnetic hover en botones ───────────────────────────────────────
    document.querySelectorAll('.btn-primary, .btn-gold, .btn-ghost-light').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            btn.style.transform = `translateY(-2px) translate(${x * 0.07}px, ${y * 0.07}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ─── 17. Value number opacity al hover ───────────────────────────────────
    document.querySelectorAll('.value-item').forEach(item => {
        const num = item.querySelector('.value-number');
        if (!num) return;
        item.addEventListener('mouseenter', () => { num.style.opacity = '1'; });
        item.addEventListener('mouseleave', () => { num.style.opacity = '0.4'; });
    });

    // ─── 18. Step bubble icon swap ───────────────────────────────────────────
    document.querySelectorAll('.step-bubble').forEach(bubble => {
        const icon = bubble.querySelector('.step-icon');
        const num  = bubble.querySelector('.step-num');
        if (!icon || !num) return;
        bubble.addEventListener('mouseenter', () => {
            icon.style.transform = 'translate(-50%,-50%) scale(1.3) rotate(15deg)';
        });
        bubble.addEventListener('mouseleave', () => {
            icon.style.transform = 'translate(-50%,-50%) scale(1) rotate(0deg)';
        });
    });

});

// Keyframe para línea del timeline animada
const tlStyle = document.createElement('style');
tlStyle.textContent = `
@keyframes lineGrowV {
    from { height: 0%; }
    to   { height: 100%; }
}
.timeline-line::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    background: linear-gradient(to bottom, var(--gold), var(--gold-light));
    height: 0%;
    animation: lineGrowV 1.8s cubic-bezier(0.16,1,0.3,1) 0.3s forwards;
}`;
document.head.appendChild(tlStyle);
