// ===== FIREBASE IMPORTS =====
import { initializeApp }          from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged }
                                  from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy }
                                  from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject }
                                  from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey:            "AIzaSyBl03c_M3kPR1BXWrDCi3T3V4JteJXkJDA",
    authDomain:        "estella-escribana.firebaseapp.com",
    projectId:         "estella-escribana",
    storageBucket:     "estella-escribana.firebasestorage.app",
    messagingSenderId: "947378623756",
    appId:             "1:947378623756:web:4984f6886f2a6517abe529"
};

// ===== ADMIN EMAILS (agregar el email de Estella si va a usar el panel) =====
const ADMIN_EMAILS = [
    "franpuchala8@gmail.com",       // desarrollador
    "vazquezescribana@gmail.com",   // Estella
];

// ===== INIT =====
const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const storage  = getStorage(app);
const provider = new GoogleAuthProvider();

// ===== STATE =====
let currentProps    = [];
let editingId       = null;
let newImageFiles   = [];
let existingImages  = []; // { url, path } objects for existing images
let imagesToDelete  = []; // { url, path } to delete on save

// ===== DOM REFS =====
const loginScreen   = document.getElementById('login-screen');
const adminPanel    = document.getElementById('admin-panel');
const loginError    = document.getElementById('login-error');
const googleLoginBtn= document.getElementById('google-login-btn');
const logoutBtn     = document.getElementById('logout-btn');
const userNameEl    = document.getElementById('user-name');
const userPhotoEl   = document.getElementById('user-photo');
const propsGrid     = document.getElementById('props-grid');
const emptyState    = document.getElementById('empty-state');
const loadingState  = document.getElementById('loading-state');
const propCountText = document.getElementById('prop-count-text');
const addBtn        = document.getElementById('add-btn');
const modal         = document.getElementById('modal');
const modalOverlay  = document.getElementById('modal-overlay');
const modalTitle    = document.getElementById('modal-title');
const modalClose    = document.getElementById('modal-close');
const btnCancel     = document.getElementById('btn-cancel');
const btnSave       = document.getElementById('btn-save');
const saveText      = document.getElementById('save-text');
const saveSpinner   = document.getElementById('save-spinner');
const imgPreview    = document.getElementById('img-preview');
const fileInput     = document.getElementById('f-images');
const uploadArea    = document.getElementById('upload-area');
const toast         = document.getElementById('toast');

// ===== AUTH =====
onAuthStateChanged(auth, user => {
    console.log('Auth state changed:', user ? user.email : 'no user');
    if (user) {
        if (!ADMIN_EMAILS.includes(user.email)) {
            showLoginError(`Cuenta "${user.email}" no tiene acceso.`);
            signOut(auth);
            return;
        }
        loginScreen.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        userNameEl.textContent = user.displayName || user.email;
        if (user.photoURL) userPhotoEl.src = user.photoURL;
        loadProperties();
    } else {
        loginScreen.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        loginError.classList.add('hidden');
    }
});

googleLoginBtn.addEventListener('click', async () => {
    loginError.classList.add('hidden');
    try {
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
    } catch (err) {
        console.error('Auth error code:', err.code, err.message);
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
            showLoginError('El popup fue bloqueado. Permitir popups para este sitio e intentar de nuevo.');
        } else if (err.code === 'auth/unauthorized-domain') {
            showLoginError('Dominio no autorizado en Firebase. Contactar al desarrollador.');
        } else {
            showLoginError(`Error: ${err.code || err.message}`);
        }
    }
});

logoutBtn.addEventListener('click', () => signOut(auth));

function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
}

// ===== LOAD PROPERTIES =====
async function loadProperties() {
    setLoading(true);
    try {
        const q    = query(collection(db, 'propiedades'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        currentProps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderProps();
    } catch (err) {
        propsGrid.innerHTML = '<div class="error-msg">Error al cargar propiedades. Revisá la conexión.</div>';
        console.error(err);
    } finally {
        setLoading(false);
    }
}

function setLoading(loading) {
    loadingState.style.display = loading ? 'block' : 'none';
    propsGrid.style.display    = loading ? 'none'  : '';
}

function renderProps() {
    propsGrid.innerHTML = '';

    const activas   = currentProps.filter(p => p.activa !== false).length;
    const inactivas = currentProps.length - activas;
    propCountText.textContent = `${currentProps.length} propiedades (${activas} activas, ${inactivas} inactivas)`;

    if (currentProps.length === 0) {
        emptyState.classList.remove('hidden');
        propsGrid.style.display = 'none';
        return;
    }
    emptyState.classList.add('hidden');
    propsGrid.style.display = '';

    currentProps.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'admin-card';

        const firstImg = prop.imagenes?.[0];
        const imgUrl   = firstImg ? (typeof firstImg === 'object' ? firstImg.url : firstImg) : '';
        const isActive = prop.activa !== false;

        card.innerHTML = `
            <div class="admin-card-img" style="${imgUrl ? `background-image:url('${imgUrl}')` : ''}">
                ${!imgUrl ? '<span class="no-img">Sin imagen</span>' : ''}
                <span class="admin-badge ${isActive ? 'badge-active' : 'badge-inactive'}">
                    ${isActive ? 'Activa' : 'Inactiva'}
                </span>
            </div>
            <div class="admin-card-body">
                <div class="admin-card-tipo">${capitalize(prop.tipo || '')} · ${prop.operacion || ''}</div>
                <h3>${prop.titulo || 'Sin título'}</h3>
                <p class="admin-card-price">${prop.precio || ''}</p>
                <p class="admin-card-loc">📍 ${prop.ubicacion || ''}</p>
            </div>
            <div class="admin-card-actions">
                <button class="btn-edit">✏️ Editar</button>
                <button class="btn-delete">🗑️ Eliminar</button>
            </div>
        `;

        card.querySelector('.btn-edit').addEventListener('click',   () => openEditModal(prop));
        card.querySelector('.btn-delete').addEventListener('click', () => confirmDelete(prop));

        propsGrid.appendChild(card);
    });
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ===== MODAL =====
addBtn.addEventListener('click', openAddModal);
[modalClose, modalOverlay, btnCancel].forEach(el => el.addEventListener('click', closeModal));

function openAddModal() {
    editingId      = null;
    newImageFiles  = [];
    existingImages = [];
    imagesToDelete = [];
    modalTitle.textContent = 'Nueva propiedad';
    document.getElementById('prop-form').reset();
    document.getElementById('f-activa').checked = true;
    imgPreview.innerHTML = '';
    openModal();
}

function openEditModal(prop) {
    editingId      = prop.id;
    newImageFiles  = [];
    imagesToDelete = [];

    // Normalize images to { url, path } format
    existingImages = (prop.imagenes || []).map(img =>
        typeof img === 'object' ? img : { url: img, path: null }
    );

    modalTitle.textContent = 'Editar propiedad';
    document.getElementById('f-titulo').value     = prop.titulo     || '';
    document.getElementById('f-precio').value     = prop.precio     || '';
    document.getElementById('f-tipo').value       = prop.tipo       || '';
    document.getElementById('f-operacion').value  = prop.operacion  || '';
    document.getElementById('f-dorm').value       = prop.dormitorios || '';
    document.getElementById('f-metros').value     = prop.metros     || '';
    document.getElementById('f-ubicacion').value  = prop.ubicacion  || '';
    document.getElementById('f-desc').value       = prop.descripcion || '';
    document.getElementById('f-activa').checked   = prop.activa !== false;
    fileInput.value = '';

    renderImagePreview();
    openModal();
}

function openModal() {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    newImageFiles  = [];
    existingImages = [];
    imagesToDelete = [];
    imgPreview.innerHTML = '';
    fileInput.value = '';
}

// ===== IMAGE HANDLING =====
fileInput.addEventListener('change', e => {
    newImageFiles = [...newImageFiles, ...Array.from(e.target.files)];
    renderImagePreview();
});

uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    newImageFiles = [...newImageFiles, ...files];
    renderImagePreview();
});

function renderImagePreview() {
    imgPreview.innerHTML = '';

    // Existing images
    existingImages.forEach((img, idx) => {
        const div = document.createElement('div');
        div.className = 'img-thumb';
        div.innerHTML = `
            <img src="${img.url}" alt="">
            <button class="img-remove" title="Eliminar imagen">✕</button>
            ${idx === 0 ? '<span class="img-main">Principal</span>' : ''}
        `;
        div.querySelector('.img-remove').addEventListener('click', () => {
            imagesToDelete.push(existingImages[idx]);
            existingImages.splice(idx, 1);
            renderImagePreview();
        });
        imgPreview.appendChild(div);
    });

    // New (pending upload) images
    newImageFiles.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = e => {
            const div = document.createElement('div');
            div.className = 'img-thumb img-thumb--new';
            div.innerHTML = `
                <img src="${e.target.result}" alt="">
                <button class="img-remove" title="Quitar imagen">✕</button>
                <span class="img-new-label">Nueva</span>
            `;
            div.querySelector('.img-remove').addEventListener('click', () => {
                newImageFiles.splice(idx, 1);
                renderImagePreview();
            });
            imgPreview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// ===== SAVE PROPERTY =====
btnSave.addEventListener('click', saveProperty);

async function saveProperty() {
    const titulo    = document.getElementById('f-titulo').value.trim();
    const precio    = document.getElementById('f-precio').value.trim();
    const tipo      = document.getElementById('f-tipo').value;
    const operacion = document.getElementById('f-operacion').value;
    const ubicacion = document.getElementById('f-ubicacion').value.trim();

    if (!titulo || !precio || !tipo || !operacion || !ubicacion) {
        showToast('Completá los campos obligatorios (*)', 'error');
        return;
    }

    setSaving(true);
    try {
        // 1. Delete images marked for removal
        for (const img of imagesToDelete) {
            if (img.path) {
                try { await deleteObject(ref(storage, img.path)); } catch (e) { /* ignore */ }
            }
        }

        // 2. Upload new images
        const newImgData = [];
        for (const file of newImageFiles) {
            const ext  = file.name.split('.').pop().toLowerCase();
            const path = `propiedades/${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;
            const sRef = ref(storage, path);
            await uploadBytes(sRef, file);
            const url  = await getDownloadURL(sRef);
            newImgData.push({ url, path });
        }

        // 3. Build final images array
        const allImages = [...existingImages, ...newImgData];

        const data = {
            titulo,
            precio,
            tipo,
            operacion,
            ubicacion,
            dormitorios:  parseInt(document.getElementById('f-dorm').value)   || 0,
            metros:       parseInt(document.getElementById('f-metros').value)  || 0,
            descripcion:  document.getElementById('f-desc').value.trim(),
            imagenes:     allImages,
            activa:       document.getElementById('f-activa').checked,
        };

        if (editingId) {
            await updateDoc(doc(db, 'propiedades', editingId), data);
            showToast('Propiedad actualizada ✓', 'success');
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, 'propiedades'), data);
            showToast('Propiedad creada ✓', 'success');
        }

        closeModal();
        await loadProperties();

    } catch (err) {
        console.error(err);
        showToast('Error al guardar. Revisá la consola.', 'error');
    } finally {
        setSaving(false);
    }
}

// ===== DELETE PROPERTY =====
async function confirmDelete(prop) {
    if (!confirm(`¿Eliminar "${prop.titulo}"?\nEsta acción no se puede deshacer.`)) return;
    try {
        // Delete images from Storage
        for (const img of (prop.imagenes || [])) {
            const path = typeof img === 'object' ? img.path : null;
            if (path) {
                try { await deleteObject(ref(storage, path)); } catch (e) { /* ignore */ }
            }
        }
        await deleteDoc(doc(db, 'propiedades', prop.id));
        showToast('Propiedad eliminada', 'success');
        await loadProperties();
    } catch (err) {
        console.error(err);
        showToast('Error al eliminar', 'error');
    }
}

// ===== HELPERS =====
function setSaving(saving) {
    btnSave.disabled = saving;
    saveText.classList.toggle('hidden', saving);
    saveSpinner.classList.toggle('hidden', !saving);
}

let toastTimer;
function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className   = `toast toast-${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3500);
}
