// JP Artesanías - Carrito Modernizado
document.addEventListener('DOMContentLoaded', () => {
    initCart();
    updateHeaderCartCount();
    initMobileMenu();
    handleScroll();
    addScrollAnimations();
});

// Inicializar el carrito
const initCart = () => {
    loadCartItems();
    setupEventListeners();
};

// Cargar items del carrito
const loadCartItems = () => {
    const cartContainer = document.getElementById('cart-container');
    const subtotalElement = document.getElementById('subtotal-price');
    const totalElement = document.getElementById('total-price');
    const itemsCountElement = document.getElementById('items-count');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>Explora nuestra tienda y encuentra productos increíbles</p>
                <a href="../Productos/Productos.html" class="btn-explore">
                    Explorar Productos
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
        `;
        subtotalElement.textContent = '$0';
        totalElement.textContent = '$0';
        if (itemsCountElement) itemsCountElement.textContent = '0';
        return;
    }

    let subtotal = 0;
    cartContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.style.animationDelay = `${index * 0.1}s`;
        
        cartItem.innerHTML = `
            <img src="${item.image || '../Img/placeholder.jpg'}" 
                 alt="${item.name}" 
                 class="cart-item-img"
                 loading="lazy">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-details">
                    <span>Precio unitario: $${item.price.toLocaleString()}</span>
                </div>
                <span class="cart-item-price">$${itemTotal.toLocaleString()}</span>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-selector">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                    <input type="number" 
                           class="qty-input" 
                           value="${item.quantity}" 
                           min="1" 
                           onchange="updateQuantity('${item.id}', this.value)"
                           readonly>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="removeItem('${item.id}')">
                    Eliminar
                </button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
    totalElement.textContent = `$${subtotal.toLocaleString()}`;
    if (itemsCountElement) itemsCountElement.textContent = cart.length;
};

// Actualizar cantidad de un producto
window.updateQuantity = (productId, newQuantity) => {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        removeItem(productId);
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Animación de actualización
        showNotification('Cantidad actualizada', 'success');
        loadCartItems();
        updateHeaderCartCount();
    }
};

// Eliminar producto del carrito
window.removeItem = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Animación de salida
    const itemElement = event.target.closest('.cart-item');
    if (itemElement) {
        itemElement.style.animation = 'fadeOut 0.4s ease forwards';
        
        setTimeout(() => {
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            
            loadCartItems();
            updateHeaderCartCount();
            showNotification('Producto eliminado del carrito', 'info');
        }, 400);
    }
};

// Actualizar contador del carrito en el header
const updateHeaderCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countBadge = document.querySelector('.cart-count');
    
    if (countBadge) {
        countBadge.textContent = totalItems;
        
        // Animación del badge
        countBadge.style.animation = 'none';
        setTimeout(() => {
            countBadge.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
};

// Event Listeners
const setupEventListeners = () => {
    // Botón de código promocional
    const promoBtn = document.querySelector('.promo-btn');
    if (promoBtn) {
        promoBtn.addEventListener('click', handlePromoCode);
    }
    
    // Input de código promocional con Enter
    const promoInput = document.querySelector('.promo-input');
    if (promoInput) {
        promoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePromoCode();
            }
        });
    }
};

// Manejar código promocional
const handlePromoCode = () => {
    const promoInput = document.querySelector('.promo-input');
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        showNotification('Ingresa un código promocional', 'error');
        return;
    }
    
    // Códigos de ejemplo
    const validCodes = {
        'DESCUENTO10': 0.10,
        'BIENVENIDO': 0.15,
        'PREMIUM20': 0.20
    };
    
    if (validCodes[code]) {
        const discount = validCodes[code];
        showNotification(`¡Código aplicado! ${discount * 100}% de descuento`, 'success');
        applyDiscount(discount);
        promoInput.value = '';
    } else {
        showNotification('Código no válido', 'error');
    }
};

// Aplicar descuento
const applyDiscount = (discountPercent) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * discountPercent;
    const total = subtotal - discount;
    
    const totalElement = document.getElementById('total-price');
    const subtotalElement = document.getElementById('subtotal-price');
    
    // Mostrar descuento
    const summaryBody = document.querySelector('.summary-body');
    let discountLine = summaryBody.querySelector('.discount-line');
    
    if (!discountLine) {
        discountLine = document.createElement('div');
        discountLine.className = 'summary-line discount-line';
        summaryBody.insertBefore(discountLine, summaryBody.querySelector('.summary-divider'));
    }
    
    discountLine.innerHTML = `
        <span style="color: var(--success);">Descuento</span>
        <span style="color: var(--success); font-weight: 700;">-$${discount.toLocaleString()}</span>
    `;
    
    totalElement.textContent = `$${total.toLocaleString()}`;
};

// Mostrar notificación
const showNotification = (message, type = 'success') => {
    const colors = {
        success: 'linear-gradient(135deg, #22c55e, #16a34a)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #5dade2, #3498db)'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${colors[type]};
        color: white;
        padding: 18px 28px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-size: 0.95em;
        max-width: 320px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <span style="font-size: 1.5em;">${icons[type]}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
};

// Menú hamburguesa para móvil
const initMobileMenu = () => {
    // Crear botón hamburguesa si no existe
    let menuToggle = document.querySelector('.menu-toggle');
    if (!menuToggle) {
        menuToggle = document.createElement('div');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        const headerContainer = document.querySelector('.header-container');
        const searchAndCart = document.querySelector('.search-and-cart');
        headerContainer.insertBefore(menuToggle, searchAndCart);
    }
    
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Cerrar menú al hacer click en un enlace
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }
};

// Efecto de scroll en el header
const handleScroll = () => {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};

// Animaciones al hacer scroll
const addScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos
    const animatedElements = document.querySelectorAll('.cart-item, .summary-card, .trust-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
};

// Actualizar carrito si se modifica desde otra pestaña
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        loadCartItems();
        updateHeaderCartCount();
        showNotification('Carrito actualizado', 'info');
    }
});

// Prevenir pérdida de datos al salir
window.addEventListener('beforeunload', (e) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
        // Los navegadores modernos muestran un mensaje genérico
        e.preventDefault();
        e.returnValue = '';
    }
});

// Animación adicional para el botón de checkout
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('mouseenter', () => {
            checkoutBtn.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        checkoutBtn.addEventListener('mouseleave', () => {
            checkoutBtn.style.transform = 'translateY(0) scale(1)';
        });
    }
});

// Añadir estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(style);