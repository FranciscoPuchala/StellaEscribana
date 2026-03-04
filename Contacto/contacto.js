// contacto.js - Página de contacto de Stella Escribana

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu
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

    // Pre-seleccionar asunto si viene de una propiedad
    const urlParams = new URLSearchParams(window.location.search);
    const propiedadParam = urlParams.get('propiedad');
    if (propiedadParam) {
        const asuntoSelect = document.getElementById('asunto');
        const mensajeTextarea = document.getElementById('mensaje');
        if (asuntoSelect) asuntoSelect.value = 'propiedad';
        if (mensajeTextarea) {
            mensajeTextarea.value = `Hola, me interesa la propiedad: "${decodeURIComponent(propiedadParam)}". Quisiera recibir más información.`;
        }
    }

    // Header shadow on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 50
            ? '0 4px 24px rgba(26,39,68,0.12)' : 'none';
    }, { passive: true });

    // Parallax on hero background
    const hero = document.querySelector('.page-hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            hero.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
        }, { passive: true });
    }

    // IntersectionObserver — reveal info cards, h2, form card
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    // Contact info heading
    const contactH2 = document.querySelector('.contact-info h2');
    if (contactH2) {
        contactH2.classList.add('reveal', 'up');
        observer.observe(contactH2);
    }

    // Info cards
    document.querySelectorAll('.info-card').forEach(card => {
        observer.observe(card);
    });

    // Form card
    const formCard = document.querySelector('.form-card');
    if (formCard) observer.observe(formCard);

    // Contact intro paragraph
    const introP = document.querySelector('.contact-intro');
    if (introP) {
        introP.classList.add('reveal', 'blur');
        introP.style.transitionDelay = '0.2s';
        observer.observe(introP);
    }

    // Form submission — Formspree
    const form = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://formspree.io/f/xbdanwkd', {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    form.style.display = 'none';
                    if (formSuccess) formSuccess.style.display = 'block';
                } else {
                    submitBtn.textContent = 'Error al enviar. Intentá de nuevo.';
                    submitBtn.disabled = false;
                }
            } catch {
                submitBtn.textContent = 'Error al enviar. Intentá de nuevo.';
                submitBtn.disabled = false;
            }
        });
    }
});
