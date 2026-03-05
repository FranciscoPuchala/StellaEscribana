// pagina_inicio.js — Animaciones completas para Stella Escribana

document.addEventListener('DOMContentLoaded', () => {

    /* ====================================================
       1. MOBILE MENU
    ==================================================== */
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

    /* ====================================================
       2. HEADER — sombra al scrollear
    ==================================================== */
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 60
            ? '0 4px 24px rgba(26, 39, 68, 0.12)'
            : 'none';
    }, { passive: true });

    /* ====================================================
       3. PARALLAX del hero background
    ==================================================== */
    const heroBg = document.querySelector('.hero-bg');
    const ctaBg  = document.querySelector('.cta-bg');

    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        if (heroBg) {
            heroBg.style.transform = `scale(1) translateY(${sy * 0.3}px)`;
        }
        if (ctaBg) {
            const ctaSection = ctaBg.closest('.cta-section');
            if (ctaSection) {
                const rect = ctaSection.getBoundingClientRect();
                const offset = (window.innerHeight - rect.top) * 0.15;
                ctaBg.style.transform = `translateY(${-offset}px) scale(1.05)`;
            }
        }
    }, { passive: true });

    /* ====================================================
       4. INTERSECTION OBSERVER — reveal de secciones
    ==================================================== */
    // Asignar clases reveal + dirección a los elementos
    const revealMap = [
        { sel: '.section-tag',               cls: 'blur',  base: 0 },
        { sel: '.section-header h2',         cls: 'up',    base: 100 },
        { sel: '.section-header p',          cls: 'up',    base: 200 },
        { sel: '.service-card',              cls: 'up',    base: 0,  stagger: 120 },
        { sel: '.stat-item',                 cls: 'scale', base: 0,  stagger: 100 },
        { sel: '.why-us-image-col',          cls: 'left',  base: 0 },
        { sel: '.why-us-content',            cls: 'right', base: 150 },
        { sel: '.feature-item',              cls: 'left',  base: 0,  stagger: 100 },
        { sel: '.why-us-content h2',         cls: 'up',    base: 0 },
        { sel: '.why-us-intro',              cls: 'blur',  base: 100 },
        { sel: '.why-us-actions',            cls: 'up',    base: 200 },
        { sel: '.cta-content h2',            cls: 'up',    base: 0 },
        { sel: '.cta-content p',             cls: 'blur',  base: 150 },
        { sel: '.cta-buttons',               cls: 'scale', base: 280 },
        { sel: '.footer-brand',              cls: 'up',    base: 0 },
        { sel: '.footer-section',            cls: 'up',    base: 0,  stagger: 100 },
    ];

    revealMap.forEach(({ sel, cls, base, stagger }) => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('reveal', cls);
            const delay = base + (stagger ? i * stagger : 0);
            el.style.transitionDelay = `${delay}ms`;
        });
    });

    // Crear el observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    /* ====================================================
       5. COUNTER ANIMATION para stats
    ==================================================== */
    const statConfig = [
        { el: null, target: 20,  prefix: '+', suffix: '' },
        { el: null, target: 200, prefix: '+', suffix: '' },
        { el: null, target: 100, prefix: '',  suffix: '%' },
        { el: null, target: 24,  prefix: '',  suffix: 'h' },
    ];

    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((el, i) => {
        if (statConfig[i]) statConfig[i].el = el;
    });

    const animateCounter = (cfg) => {
        if (!cfg.el) return;
        const duration = 1800;
        const start = performance.now();
        cfg.el.classList.add('reveal', 'scale', 'animate-in');

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(ease * cfg.target);
            cfg.el.textContent = cfg.prefix + current + cfg.suffix;
            if (progress < 1) requestAnimationFrame(tick);
            else cfg.el.textContent = cfg.prefix + cfg.target + cfg.suffix;
        };
        requestAnimationFrame(tick);
    };

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        let countersStarted = false;
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    statConfig.forEach((cfg, i) => {
                        setTimeout(() => animateCounter(cfg), i * 180);
                    });
                    statsObserver.unobserve(statsBar);
                }
            });
        }, { threshold: 0.4 });
        statsObserver.observe(statsBar);
    }

    /* ====================================================
       6. STATS BAR — slide desde abajo
    ==================================================== */
    const statsBarEl = document.querySelector('.stats-bar');
    if (statsBarEl) {
        statsBarEl.style.opacity = '0';
        statsBarEl.style.transform = 'translateY(40px)';
        statsBarEl.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        const statsRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statsBarEl.style.opacity = '1';
                    statsBarEl.style.transform = 'translateY(0)';
                    statsRevealObserver.unobserve(statsBarEl);
                }
            });
        }, { threshold: 0.3 });
        statsRevealObserver.observe(statsBarEl);
    }

    /* ====================================================
       7. RIPPLE en service cards al hacer click
    ==================================================== */
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const existing = card.querySelector('.ripple');
            if (existing) existing.remove();

            const rect = card.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.cssText = `
                width: ${size}px; height: ${size}px;
                left: ${e.clientX - rect.left - size / 2}px;
                top: ${e.clientY - rect.top - size / 2}px;
            `;
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    /* ====================================================
       8. MAGNETIC HOVER en botones principales
    ==================================================== */
    const magneticButtons = document.querySelectorAll('.btn-primary, .btn-gold, .btn-ghost');
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translateY(-2px) translate(${x * 0.08}px, ${y * 0.08}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => btn.style.transition = '', 500);
        });
    });

    /* ====================================================
       9. PARALLAX suave en imagen de why-us
    ==================================================== */
    const whyUsImage = document.querySelector('.image-wrapper img');
    if (whyUsImage) {
        window.addEventListener('scroll', () => {
            const rect = whyUsImage.closest('.why-us-section')?.getBoundingClientRect();
            if (!rect) return;
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            whyUsImage.style.transform = `scale(1.04) translateY(${center * 0.04}px)`;
        }, { passive: true });
    }

    /* ====================================================
       10. BADGE — aparece con bounce cuando entra al viewport
    ==================================================== */
    const badge = document.querySelector('.experience-badge');
    if (badge) {
        badge.style.opacity = '0';
        badge.style.transform = 'scale(0.5) rotate(-8deg)';

        const badgeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    badge.style.transition = 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    badge.style.opacity = '1';
                    badge.style.transform = '';
                    badgeObserver.unobserve(badge);
                }
            });
        }, { threshold: 0.5 });
        badgeObserver.observe(badge);
    }

    /* ====================================================
       11. HERO TITLE — líneas aparecen de a una
    ==================================================== */
    const heroH2 = document.querySelector('.hero-content h2');
    if (heroH2) {
        // Ya tiene animación CSS (blurIn), agregamos split de líneas
        const text = heroH2.innerHTML;
        const lines = text.split('<br>');
        heroH2.innerHTML = lines.map((line, i) => `
            <span class="hero-line" style="
                display:block;
                overflow:hidden;
                animation: textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.65 + i * 0.18}s both;
            ">${line}</span>
        `).join('');
    }

    /* ====================================================
       12. IMAGE FRAME — animación al entrar en viewport
    ==================================================== */
    const imageFrame = document.querySelector('.image-frame');
    if (imageFrame) {
        imageFrame.style.opacity = '0';
        imageFrame.style.transform = 'translate(10px, 10px) scale(0.9)';
        const frameObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    imageFrame.style.transition = 'opacity 0.8s ease 0.4s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s';
                    imageFrame.style.opacity = '1';
                    imageFrame.style.transform = 'translate(0, 0) scale(1)';
                    frameObserver.unobserve(imageFrame);
                }
            });
        }, { threshold: 0.3 });
        frameObserver.observe(imageFrame);
    }

    /* ====================================================
       13. SERVICE CARDS — 3D tilt en hover
    ==================================================== */
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-12px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ====================================================
       14. SCROLL SUAVE para hero
    ==================================================== */
    const scrollHint = document.querySelector('.hero-scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', () => {
            const statsBar = document.querySelector('.stats-bar');
            if (statsBar) statsBar.scrollIntoView({ behavior: 'smooth' });
        });
        scrollHint.style.cursor = 'pointer';
    }

    /* ====================================================
       15. LOGO — efecto de aparición en letras
    ==================================================== */
    const logoH1 = document.querySelector('.logo h1');
    if (logoH1) {
        logoH1.style.animation = 'fadeDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both';
    }
    const logoSub = document.querySelector('.logo-subtitle');
    if (logoSub) {
        logoSub.style.animation = 'fadeDown 0.6s ease 0.45s both';
    }
});
