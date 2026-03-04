document.addEventListener('DOMContentLoaded', () => {

    const payButton = document.getElementById('main-pay-button');
    const statusMsg = document.getElementById('status-message');
    const totalElement = document.getElementById('total-price');
    const orderItems = document.getElementById('order-items');

    console.log('Botón detectado:', payButton);

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (totalElement) {
        const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
        totalElement.textContent = `$${total}`;
    }

    if (orderItems) {
        orderItems.innerHTML = cart.map(item => `
            <div>${item.name} x${item.quantity}</div>
        `).join('');
    }

    payButton.addEventListener('click', () => {

        if (cart.length === 0) {
            statusMsg.textContent = 'El carrito está vacío';
            statusMsg.style.color = 'red';
            return;
        }

        const method = document.querySelector('input[name="payment-method"]:checked').value;

        if (method === 'transferencia') {
            window.open('https://tuweb.com/datos-bancarios.html', '_blank');
            return;
        }

        payButton.disabled = true;
        payButton.textContent = 'Redirigiendo a Mercado Pago...';

        fetch('https://layoutprueba.com/create_preference.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
        })
        .then(res => res.json())
        .then(data => {
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error();
            }
        })
        .catch(() => {
            statusMsg.textContent = 'Error al iniciar el pago';
            statusMsg.style.color = 'red';
            payButton.disabled = false;
            payButton.textContent = 'Proceder al Pago →';
        });
    });
});
