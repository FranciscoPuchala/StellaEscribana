// pagina_producto.js - Página de detalle de propiedad

// ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, getDoc }
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

// ===== ELEMENTS =====
const propertyDetailSection = document.getElementById('property-detail-container');
const productImageElement   = document.getElementById('product-image');

// ===== RENDER =====
const renderPropertyDetails = (selectedProperty) => {
    document.getElementById('product-name').textContent = selectedProperty.name;
    document.getElementById('product-price').textContent = selectedProperty.price;
    document.getElementById('product-description').textContent = selectedProperty.description;
    document.getElementById('breadcrumb-name').textContent = selectedProperty.name;

    const typeTag = document.getElementById('property-type-tag');
    if (typeTag && selectedProperty.category) {
        typeTag.textContent = selectedProperty.category;
    }

    // Galería de imágenes
    const images = selectedProperty.images && selectedProperty.images.length > 0
        ? selectedProperty.images
        : (selectedProperty.image ? [selectedProperty.image] : []);

    if (productImageElement && images.length > 0) {
        let currentIdx = 0;

        const counter  = document.getElementById('gallery-counter');
        const thumbsEl = document.getElementById('gallery-thumbs');
        const prevBtn  = document.getElementById('gallery-prev');
        const nextBtn  = document.getElementById('gallery-next');

        const preload = (idx) => {
            const next = images[(idx + 1) % images.length];
            if (next) { const img = new Image(); img.src = next; }
        };

        const galleryMain = document.querySelector('.gallery-main');

        const showImage = (idx) => {
            currentIdx = idx;
            const newSrc = images[idx];
            if (productImageElement.src !== newSrc) {
                productImageElement.classList.remove('img-loaded');
                productImageElement.src = newSrc;
            }
            productImageElement.alt = `Imagen ${idx + 1} de ${selectedProperty.name}`;
            if (counter) counter.textContent = images.length > 1 ? `${idx + 1} / ${images.length}` : '';
            thumbsEl && thumbsEl.querySelectorAll('.thumb').forEach((t, i) => {
                t.classList.toggle('active', i === idx);
            });
            preload(idx);
        };

        productImageElement.addEventListener('load', () => {
            productImageElement.classList.add('img-loaded');
            if (galleryMain) galleryMain.classList.add('loaded');
        });
        if (productImageElement.complete && productImageElement.naturalWidth > 0) {
            productImageElement.classList.add('img-loaded');
            if (galleryMain) galleryMain.classList.add('loaded');
        }

        if (thumbsEl && images.length > 1) {
            images.forEach((url, i) => {
                const thumb = document.createElement('div');
                thumb.className = 'thumb' + (i === 0 ? ' active' : '');
                const img = document.createElement('img');
                img.src = url;
                img.alt = '';
                img.loading = i === 0 ? 'eager' : 'lazy';
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
                thumb.appendChild(img);
                thumb.addEventListener('click', () => showImage(i));
                thumbsEl.appendChild(thumb);
            });
        }

        if (prevBtn && nextBtn && images.length > 1) {
            prevBtn.style.display = '';
            nextBtn.style.display = '';
            prevBtn.addEventListener('click', () => showImage((currentIdx - 1 + images.length) % images.length));
            nextBtn.addEventListener('click', () => showImage((currentIdx + 1) % images.length));
        } else {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }

        showImage(0);
    }

    const featuresList = document.getElementById('product-features');
    if (featuresList) {
        featuresList.innerHTML = '';
        if (selectedProperty.features && selectedProperty.features.length > 0) {
            selectedProperty.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });
        }
    }

    document.title = `${selectedProperty.name} | Stella Escribana`;

    const consultarBtn = document.getElementById('consultar-btn');
    if (consultarBtn) {
        consultarBtn.href = `../Contacto/contactos.html?propiedad=${encodeURIComponent(selectedProperty.name)}`;
    }
};

// ===== NOT FOUND =====
function showNotFound() {
    if (propertyDetailSection) {
        propertyDetailSection.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <p style="font-size: 1.1rem; color: #6b7280; margin-bottom: 20px;">
                    No se encontró la propiedad. Por favor, volvé al listado.
                </p>
                <a href="../Productos/Productos.html" style="
                    display: inline-block;
                    background: #1a2744;
                    color: white;
                    padding: 14px 32px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 600;
                ">Ver propiedades</a>
            </div>
        `;
    }
}

// ===== ANIMATE FEATURES =====
function reanimateFeatures() {
    const items = document.querySelectorAll('.features-section li');
    items.forEach((li, i) => {
        li.style.opacity = '0';
        li.style.animation = 'none';
        void li.offsetWidth;
        li.style.animation = `featureIn 0.45s ease ${1.1 + i * 0.1}s forwards`;
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    if (productImageElement) {
        productImageElement.onerror = function() {
            this.style.display = 'none';
        };
    }

    const params = new URLSearchParams(window.location.search);
    const propId = params.get('id');

    if (propId) {
        // Intentar localStorage primero (carga instantánea si viene del listado)
        const cached = JSON.parse(localStorage.getItem('selectedProduct'));
        if (cached && cached.id === propId) {
            renderPropertyDetails(cached);
            setTimeout(reanimateFeatures, 50);
        } else {
            // Cargar desde Firebase (link compartido)
            try {
                const docSnap = await getDoc(doc(db, 'propiedades', propId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const allImages = (data.imagenes || []).map(img => typeof img === 'object' ? img.url : img);
                    const selectedProperty = {
                        id:          docSnap.id,
                        name:        data.titulo,
                        price:       data.precio,
                        description: data.descripcion || '',
                        category:    capitalize(data.tipo),
                        image:       getFirstImageUrl(data.imagenes),
                        images:      allImages,
                        features:    buildFeatures(data),
                    };
                    renderPropertyDetails(selectedProperty);
                    setTimeout(reanimateFeatures, 50);
                } else {
                    showNotFound();
                }
            } catch (err) {
                console.error('Error cargando propiedad:', err);
                showNotFound();
            }
        }
    } else {
        // Compatibilidad: sin ?id= en URL, leer de localStorage
        const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
        if (selectedProduct) {
            renderPropertyDetails(selectedProduct);
            setTimeout(reanimateFeatures, 50);
        } else {
            showNotFound();
        }
    }

    // Mobile menu
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

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

    // Header shadow on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 50
            ? '0 4px 24px rgba(26,39,68,0.12)' : 'none';
    }, { passive: true });

    // 3D tilt on gallery image
    const gallery = document.querySelector('.property-gallery');
    if (gallery) {
        gallery.addEventListener('mousemove', (e) => {
            const rect = gallery.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            gallery.style.transform = `rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        });
        gallery.addEventListener('mouseleave', () => {
            gallery.style.transform = '';
        });
    }
});
