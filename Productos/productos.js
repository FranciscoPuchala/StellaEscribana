// productos.js — Carga propiedades desde Firebase Firestore

// ===== FIREBASE IMPORTS =====
import { initializeApp }   from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs }
                           from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey:            "AIzaSyBl03c_M3kPR1BXWrDCi3T3V4JteJXkJDA",
    authDomain:        "estella-escribana.firebaseapp.com",
    projectId:         "estella-escribana",
    storageBucket:     "estella-escribana.firebasestorage.app",
    messagingSenderId: "947378623756",
    appId:             "1:947378623756:web:4984f6886f2a6517abe529"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ===== HELPERS =====
const capitalize = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const CATEGORY_LABELS = {
    casa:         'Casas',
    departamento: 'Departamentos',
    terreno:      'Terrenos',
    local:        'Locales comerciales',
};

const CATEGORY_ORDER = ['casa', 'departamento', 'terreno', 'local'];

function getFirstImageUrl(imagenes) {
    if (!imagenes || imagenes.length === 0) return '';
    const first = imagenes[0];
    return typeof first === 'object' ? first.url : first;
}

function buildFeatures(prop) {
    const feats = [];
    if (prop.dormitorios) feats.push(`${prop.dormitorios} dormitorio${prop.dormitorios !== 1 ? 's' : ''}`);
    if (prop.metros)      feats.push(`${prop.metros} m² totales`);
    if (prop.ubicacion)   feats.push(`Ubicación: ${prop.ubicacion}`);
    if (prop.operacion)   feats.push(`Operación: ${prop.operacion}`);
    return feats;
}

// ===== CARD HTML =====
function createCardHTML(prop) {
    const imgUrl = getFirstImageUrl(prop.imagenes);
    const imgStyle = imgUrl ? `background-image:url('${imgUrl}')` : '';

    const dormSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 012-2h16a2 2 0 012 2v8"/><path d="M2 16h20"/><path d="M7 12V7a2 2 0 012-2h6a2 2 0 012 2v5"/></svg>`;
    const areaaSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
    const locSVG  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const specsHTML = [
        prop.dormitorios ? `<span>${dormSVG} ${prop.dormitorios} dorm.</span>` : '',
        prop.metros      ? `<span>${areaaSVG} ${prop.metros} m²</span>`        : '',
        prop.ubicacion   ? `<span>${locSVG} ${prop.ubicacion}</span>`           : '',
    ].filter(Boolean).join('');

    return `
        <div class="property-image" style="${imgStyle}">
            ${!imgUrl ? '<div style="width:100%;height:100%;background:var(--cream);display:flex;align-items:center;justify-content:center;color:var(--text-light);font-size:0.85rem;">Sin imagen</div>' : ''}
            <span class="property-badge">${prop.operacion || ''}</span>
        </div>
        <div class="property-info">
            <div class="property-type">${capitalize(prop.tipo || '')}</div>
            <h3>${prop.titulo || 'Sin título'}</h3>
            <p class="property-price">${prop.precio || ''}</p>
            ${specsHTML ? `<div class="property-specs">${specsHTML}</div>` : ''}
            <button class="ver-mas-btn">Ver propiedad</button>
        </div>
    `;
}

// ===== RENDER =====
function renderProperties(props) {
    const container   = document.getElementById('props-container');
    const loadingEl   = document.getElementById('props-loading');
    const emptyEl     = document.getElementById('props-empty');

    loadingEl.classList.add('hidden');

    if (props.length === 0) {
        emptyEl.classList.remove('hidden');
        return;
    }

    // Group by tipo
    const grouped = {};
    props.forEach(p => {
        const tipo = p.tipo || 'otro';
        if (!grouped[tipo]) grouped[tipo] = [];
        grouped[tipo].push(p);
    });

    // Render categories in order
    const order = [...CATEGORY_ORDER, ...Object.keys(grouped).filter(k => !CATEGORY_ORDER.includes(k))];

    order.forEach(tipo => {
        if (!grouped[tipo]) return;

        const section = document.createElement('section');
        section.className = 'property-category showing';
        section.setAttribute('data-category', tipo);

        const label = CATEGORY_LABELS[tipo] || capitalize(tipo);
        const grid  = document.createElement('div');
        grid.className = 'property-grid';

        grouped[tipo].forEach((prop, idx) => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.setAttribute('data-id', prop.id);
            card.style.animationDelay = `${idx * 0.1}s`;
            card.innerHTML = createCardHTML(prop);

            // "Ver propiedad" button
            card.querySelector('.ver-mas-btn').addEventListener('click', () => {
                const imgUrl = getFirstImageUrl(prop.imagenes);
                const selectedProperty = {
                    id:          prop.id,
                    name:        prop.titulo,
                    price:       prop.precio,
                    description: prop.descripcion || '',
                    category:    capitalize(prop.tipo),
                    image:       imgUrl,
                    features:    buildFeatures(prop),
                };
                localStorage.setItem('selectedProduct', JSON.stringify(selectedProperty));
                window.location.href = '../Producto/pagina_producto.html';
            });

            // 3D tilt on hover
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width  - 0.5;
                const y = (e.clientY - rect.top)  / rect.height - 0.5;
                card.style.transform = `translateY(-12px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });

            grid.appendChild(card);
        });

        section.innerHTML = `<h2 class="category-title reveal up">${label}</h2>`;
        section.appendChild(grid);
        container.appendChild(section);
    });

    // Animate cards in
    setTimeout(() => {
        container.querySelectorAll('.property-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 0.07}s`;
            card.classList.add('card-animate');
        });
    }, 100);

    // Reveal observer for category titles
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    container.querySelectorAll('.category-title').forEach(el => revealObserver.observe(el));

    // Wire up filter buttons now that categories exist
    setupFilters();
}

// ===== FILTERS =====
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filtersContainer = document.querySelector('.filters-container');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selected = button.dataset.category;
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            const allCategories = document.querySelectorAll('.property-category');
            allCategories.forEach(cat => {
                const catType = cat.getAttribute('data-category');
                if (selected === 'all' || catType === selected) {
                    cat.classList.remove('hiding');
                    cat.classList.add('showing');
                    cat.style.display = '';
                    setTimeout(() => {
                        cat.querySelectorAll('.property-card').forEach((card, i) => {
                            card.style.animationDelay = `${i * 0.08}s`;
                            card.classList.remove('card-animate');
                            void card.offsetWidth;
                            card.classList.add('card-animate');
                        });
                    }, 100);
                } else {
                    cat.classList.add('hiding');
                    cat.classList.remove('showing');
                    setTimeout(() => { cat.style.display = 'none'; }, 300);
                }
            });

            if (filtersContainer) {
                window.scrollTo({ top: filtersContainer.offsetTop - 100, behavior: 'smooth' });
            }
        });
    });
}

// ===== LOAD FROM FIREBASE =====
async function loadProperties() {
    try {
        const q    = query(
            collection(db, 'propiedades'),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const props = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.activa === true);
        renderProperties(props);
    } catch (err) {
        console.error('Error cargando propiedades:', err);
        document.getElementById('props-loading').classList.add('hidden');
        document.getElementById('props-empty').classList.remove('hidden');
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadProperties();

    // Header shadow on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 50
            ? '0 4px 24px rgba(26,39,68,0.12)'
            : 'none';
    }, { passive: true });

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
});
