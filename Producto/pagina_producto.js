// pagina_producto.js - Página de detalle de propiedad
// Mantiene la misma lógica de lectura de localStorage que el proyecto original

const propertyDetailSection = document.getElementById('property-detail-container');
const productImageElement = document.getElementById('product-image');

// Función para mostrar los detalles de la propiedad seleccionada
const renderPropertyDetails = (selectedProperty) => {
    document.getElementById('product-name').textContent = selectedProperty.name;
    document.getElementById('product-price').textContent = selectedProperty.price;
    document.getElementById('product-description').textContent = selectedProperty.description;
    document.getElementById('breadcrumb-name').textContent = selectedProperty.name;

    // Actualizar el tag de tipo de propiedad
    const typeTag = document.getElementById('property-type-tag');
    if (typeTag && selectedProperty.category) {
        typeTag.textContent = selectedProperty.category;
    }

    // Cargar galería de imágenes
    const images = selectedProperty.images && selectedProperty.images.length > 0
        ? selectedProperty.images
        : (selectedProperty.image ? [selectedProperty.image] : []);

    if (productImageElement && images.length > 0) {
        let currentIdx = 0;

        const counter  = document.getElementById('gallery-counter');
        const thumbsEl = document.getElementById('gallery-thumbs');
        const prevBtn  = document.getElementById('gallery-prev');
        const nextBtn  = document.getElementById('gallery-next');

        // Preload adjacent image for instant navigation
        const preload = (idx) => {
            const next = images[(idx + 1) % images.length];
            if (next) { const img = new Image(); img.src = next; }
        };

        const galleryMain = document.querySelector('.gallery-main');

        const showImage = (idx) => {
            currentIdx = idx;
            productImageElement.classList.remove('img-loaded');
            productImageElement.src = images[idx];
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

        // Thumbnails — lazy loaded with <img> instead of background-image
        if (thumbsEl && images.length > 1) {
            images.forEach((url, i) => {
                const thumb = document.createElement('div');
                thumb.className = 'thumb' + (i === 0 ? ' active' : '');
                const img = document.createElement('img');
                img.src = i < 3 ? url : '';
                img.dataset.src = url;
                img.loading = 'lazy';
                img.alt = '';
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
                thumb.appendChild(img);
                thumb.addEventListener('click', () => {
                    if (!img.src || img.src === window.location.href) img.src = img.dataset.src;
                    showImage(i);
                });
                thumbsEl.appendChild(thumb);
            });

            // Lazy load thumbs on scroll
            const thumbObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target.querySelector('img');
                        if (img && !img.src) img.src = img.dataset.src;
                        thumbObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '100px' });
            thumbsEl.querySelectorAll('.thumb').forEach(t => thumbObserver.observe(t));
        }

        // Arrows
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

    // Cargar características
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

    // Actualizar el título de la pestaña
    document.title = `${selectedProperty.name} | Stella Escribana`;

    // Configurar el botón de consulta con la propiedad pre-seleccionada en el asunto
    const consultarBtn = document.getElementById('consultar-btn');
    if (consultarBtn) {
        consultarBtn.href = `../Contacto/contactos.html?propiedad=${encodeURIComponent(selectedProperty.name)}`;
    }
};

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Manejo de error de imagen
    if (productImageElement) {
        productImageElement.onerror = function() {
            console.error('Error al cargar la imagen. Verificar la ruta en localStorage.');
            this.style.display = 'none';
        };
    }

    // Leer la propiedad seleccionada del localStorage (guardada desde la página de propiedades)
    const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));

    if (selectedProduct) {
        renderPropertyDetails(selectedProduct);
    } else {
        // Si no hay propiedad en localStorage, mostrar mensaje
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

    // After property loads, animate feature items with fresh stagger
    // (CSS stagger handles items 1-5; this ensures dynamically added items also animate)
    const reanimateFeatures = () => {
        const items = document.querySelectorAll('.features-section li');
        items.forEach((li, i) => {
            li.style.opacity = '0';
            li.style.animation = 'none';
            void li.offsetWidth; // reflow
            li.style.animation = `featureIn 0.45s ease ${1.1 + i * 0.1}s forwards`;
        });
    };

    // Run after renderPropertyDetails has populated the DOM
    if (selectedProduct) {
        setTimeout(reanimateFeatures, 50);
    }
});
