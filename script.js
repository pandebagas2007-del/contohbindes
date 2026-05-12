/* ============================================================
   script.js — Desa Muncan, Karangasem
   Fitur: AOS, Custom Cursor, Navbar, Admin Login,
          Upload Denah ke Server, Lightbox, Galeri
   ============================================================ */

'use strict';

/* ─── CONFIG ──────────────────────────────────────────────────
   Ganti nilai di bawah ini sesuai server Anda.
   ──────────────────────────────────────────────────────────── */
const CONFIG = {
    // Endpoint PHP untuk upload denah (lihat upload.php)
    uploadEndpoint: 'upload.php',

    // Endpoint untuk mengecek/mengambil denah aktif
    getDenahEndpoint: 'get_denah.php',

    // Endpoint untuk login admin (lihat admin_auth.php)
    loginEndpoint: 'admin_auth.php',

    // Ukuran maksimal upload (10MB dalam bytes)
    maxFileSize: 10 * 1024 * 1024,

    // Tipe file yang diizinkan
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

/* ─── STATE ───────────────────────────────────────────────────*/
let adminToken   = null;   // token sesi admin
let uploadedFile = null;   // file yang dipilih sebelum diupload

/* ══════════════════════════════════════════════════════════════
   INISIALISASI
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 750, once: true, offset: 70 });
    initCursor();
    initNavbar();
    loadDenahPublic();

    // Cek sesi admin yang masih aktif (pakai sessionStorage)
    const savedToken = sessionStorage.getItem('adminToken');
    const savedUser  = sessionStorage.getItem('adminUser');
    if (savedToken) {
        adminToken = savedToken;
        showAdminDashboard(savedUser || 'Admin');
    }
});

/* ══════════════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════════════ */
function initCursor() {
    const cursor   = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followX = 0, followY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    (function animateFollower() {
        followX += (mouseX - followX) * 0.12;
        followY += (mouseY - followY) * 0.12;
        follower.style.transform = `translate(${followX}px, ${followY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateFollower);
    })();
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════ */
function initNavbar() {
    const navbar  = document.getElementById('navbar');
    const scrollBtn = document.getElementById('scrollTop');
    const sections  = document.querySelectorAll('section[id], header[id]');
    const navLinks  = document.querySelectorAll('.nav-links a:not(.btn-admin)');

    // Scroll effects
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        scrollBtn.classList.toggle('visible', window.scrollY > 320);

        // Aktifkan link nav sesuai section
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${current}`
                ? 'var(--gold-light)' : '';
        });
    }, { passive: true });

    // Hamburger
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.innerHTML = isOpen ? '✕' : '&#9776;';
    });

    // Tutup mobile menu saat klik di luar
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('hamburger').innerHTML = '&#9776;';
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════════
   MUAT DENAH PUBLIK (dari server)
══════════════════════════════════════════════════════════════ */
async function loadDenahPublic() {
    try {
        const res  = await fetch(CONFIG.getDenahEndpoint + '?t=' + Date.now());
        const data = await res.json();

        if (data.success && data.url) {
            showDenahPublic(data.url, data.filename, data.uploaded_at);
        }
    } catch (err) {
        // Jika server belum ada atau error, tampilkan placeholder
        console.info('Denah belum tersedia atau server belum terhubung.');
    }
}

function showDenahPublic(url, filename, uploadedAt) {
    const emptyEl  = document.getElementById('denahEmpty');
    const loadedEl = document.getElementById('denahLoaded');
    const imgEl    = document.getElementById('denahPublicImg');

    imgEl.src = url;
    imgEl.onload = () => {
        emptyEl.style.display  = 'none';
        loadedEl.style.display = 'block';
    };
    imgEl.onerror = () => {
        console.warn('Gagal memuat denah:', url);
    };
}

/* ══════════════════════════════════════════════════════════════
   ZOOM & DOWNLOAD DENAH (Publik)
══════════════════════════════════════════════════════════════ */
function zoomDenah() {
    const src = document.getElementById('denahPublicImg').src;
    if (!src) return;
    document.getElementById('denahZoomImg').src = src;
    document.getElementById('denahZoom').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function downloadDenah() {
    const src = document.getElementById('denahPublicImg').src;
    if (!src) return;
    const a = document.createElement('a');
    a.href     = src;
    a.download = 'denah-desa-muncan.jpg';
    a.click();
}

/* ══════════════════════════════════════════════════════════════
   GALERI — LIGHTBOX
══════════════════════════════════════════════════════════════ */
function openLightbox(itemEl) {
    const img = itemEl.querySelector('img');
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightboxImg').alt = img.alt;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
}

// ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
        document.getElementById('denahZoom').classList.remove('open');
        document.body.style.overflow = '';
        closeAdminPanel();
    }
});

/* ══════════════════════════════════════════════════════════════
   ADMIN PANEL — BUKA / TUTUP
══════════════════════════════════════════════════════════════ */
function openAdminPanel(e) {
    if (e) e.preventDefault();
    document.getElementById('adminOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset form jika bukan admin
    if (!adminToken) {
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
        document.getElementById('loginError').textContent = '';
    }
}

function closeAdminPanel(e) {
    // Tutup hanya jika klik overlay (bukan modal-box)
    if (e && document.getElementById('adminBox').contains(e.target)) return;
    document.getElementById('adminOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════════
   ADMIN — LOGIN
   Mengirim username + password ke server (admin_auth.php).
   Server mengembalikan token jika kredensial valid.
══════════════════════════════════════════════════════════════ */
async function doLogin() {
    const username = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPass').value;
    const errorEl  = document.getElementById('loginError');

    errorEl.textContent = '';

    if (!username || !password) {
        errorEl.textContent = 'Username dan password wajib diisi.';
        return;
    }

    const btn = document.querySelector('#loginPanel .btn-modal-primary');
    btn.textContent = 'Memverifikasi...';
    btn.disabled    = true;

    try {
        const res  = await fetch(CONFIG.loginEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (data.success && data.token) {
            adminToken = data.token;
            sessionStorage.setItem('adminToken', data.token);
            sessionStorage.setItem('adminUser',  username);
            showAdminDashboard(data.display_name || username);
        } else {
            errorEl.textContent = data.message || 'Username atau password salah.';
        }
    } catch (err) {
        // ── DEVELOPMENT MODE ──────────────────────────────────────
        // Jika server belum tersedia, gunakan kredensial lokal sementara.
        // HAPUS blok ini sebelum deploy ke produksi!
        if (username === 'admin' && password === 'muncan2026') {
            adminToken = 'dev-token-local';
            sessionStorage.setItem('adminToken', adminToken);
            sessionStorage.setItem('adminUser',  username);
            showAdminDashboard('Admin Desa');
        } else {
            errorEl.textContent = 'Tidak dapat terhubung ke server. Coba lagi.';
        }
        // ── END DEVELOPMENT MODE ──────────────────────────────────
    } finally {
        btn.textContent = 'Masuk →';
        btn.disabled    = false;
    }
}

function showAdminDashboard(displayName) {
    document.getElementById('loginPanel').style.display  = 'none';
    document.getElementById('adminPanel').style.display  = 'block';
    document.getElementById('adminWelcome').textContent  = `Selamat datang, ${displayName}!`;
    loadCurrentDenahAdmin();
}

function doLogout() {
    adminToken = null;
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginPanel').style.display = 'block';
    cancelPreview();
}

function togglePassword() {
    const input = document.getElementById('adminPass');
    input.type  = input.type === 'password' ? 'text' : 'password';
}

/* ══════════════════════════════════════════════════════════════
   ADMIN — UPLOAD DENAH
══════════════════════════════════════════════════════════════ */

// Drag & Drop
function dragOver(e) {
    e.preventDefault();
    document.getElementById('uploadZone').classList.add('dragover');
}
function dragLeave(e) {
    document.getElementById('uploadZone').classList.remove('dragover');
}
function dropFile(e) {
    e.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
}

// Input file biasa
function previewAdminFile(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    // Validasi tipe
    if (!CONFIG.allowedTypes.includes(file.type)) {
        alert('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
        return;
    }
    // Validasi ukuran
    if (file.size > CONFIG.maxFileSize) {
        alert('Ukuran file terlalu besar. Maksimum 10MB.');
        return;
    }

    uploadedFile = file;

    const reader = new FileReader();
    reader.onload = (ev) => {
        document.getElementById('uploadPreviewImg').src = ev.target.result;
        document.getElementById('uploadPreviewInfo').textContent =
            `${file.name} · ${(file.size / 1024).toFixed(0)} KB`;

        document.getElementById('uploadZone').style.display    = 'none';
        document.getElementById('uploadPreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function cancelPreview() {
    uploadedFile = null;
    document.getElementById('adminFileInput').value = '';
    document.getElementById('uploadZone').style.display    = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
}

async function uploadDenah() {
    if (!uploadedFile || !adminToken) return;

    const progressEl = document.getElementById('uploadProgress');
    const fillEl     = document.getElementById('progressFill');
    const textEl     = document.getElementById('progressText');

    document.getElementById('uploadPreview').style.display  = 'none';
    progressEl.style.display = 'block';

    // Animasi progress palsu selama upload
    let pct = 0;
    const interval = setInterval(() => {
        pct = Math.min(pct + Math.random() * 12, 88);
        fillEl.style.width   = pct + '%';
        textEl.textContent   = `Mengunggah... ${Math.round(pct)}%`;
    }, 250);

    const formData = new FormData();
    formData.append('denah', uploadedFile);
    formData.append('token', adminToken);

    try {
        const res  = await fetch(CONFIG.uploadEndpoint, { method: 'POST', body: formData });
        const data = await res.json();

        clearInterval(interval);
        fillEl.style.width = '100%';
        textEl.textContent = 'Upload selesai! ✓';

        if (data.success) {
            setTimeout(() => {
                progressEl.style.display = 'none';
                document.getElementById('uploadZone').style.display = 'block';
                uploadedFile = null;
                document.getElementById('adminFileInput').value = '';

                // Refresh denah publik & panel admin
                if (data.url) showDenahPublic(data.url, data.filename, data.uploaded_at);
                loadCurrentDenahAdmin();
            }, 1000);
        } else {
            textEl.textContent = '⚠ Gagal: ' + (data.message || 'Coba lagi.');
        }
    } catch (err) {
        clearInterval(interval);

        // ── DEVELOPMENT MODE ──────────────────────────────────────
        // Simulasi upload berhasil jika server belum tersedia.
        // HAPUS blok ini sebelum deploy ke produksi!
        fillEl.style.width = '100%';
        textEl.textContent = 'Upload selesai! ✓ (mode dev)';

        // Tampilkan denah dari file lokal
        const localUrl = URL.createObjectURL(uploadedFile);
        showDenahPublic(localUrl, uploadedFile.name, new Date().toISOString());

        setTimeout(() => {
            progressEl.style.display = 'none';
            document.getElementById('uploadZone').style.display = 'block';
            uploadedFile = null;
            document.getElementById('adminFileInput').value = '';
            loadCurrentDenahAdmin();
        }, 1000);
        // ── END DEVELOPMENT MODE ──────────────────────────────────
    }
}

/* ──────────────────────────────────────────────────────────
   Muat info denah aktif di panel admin
──────────────────────────────────────────────────────────── */
async function loadCurrentDenahAdmin() {
    const container = document.getElementById('currentDenahInfo');

    try {
        const res  = await fetch(CONFIG.getDenahEndpoint + '?t=' + Date.now());
        const data = await res.json();

        if (data.success && data.url) {
            const date = data.uploaded_at
                ? new Date(data.uploaded_at).toLocaleString('id-ID')
                : '-';

            container.innerHTML = `
                <div class="current-denah-preview">
                    <img src="${data.url}" alt="Denah Aktif">
                    <p class="current-denah-meta">
                        📁 ${data.filename || 'denah.jpg'}<br>
                        🕐 Diupload: ${date}
                    </p>
                </div>`;
        } else {
            container.innerHTML = '<p class="no-denah-text">Belum ada denah yang diupload.</p>';
        }
    } catch (_) {
        // Dev: cek apakah ada denah lokal di halaman
        const src = document.getElementById('denahPublicImg')?.src;
        if (src && !src.endsWith('/')) {
            container.innerHTML = `
                <div class="current-denah-preview">
                    <img src="${src}" alt="Denah Aktif">
                    <p class="current-denah-meta">📋 Denah aktif (mode dev)</p>
                </div>`;
        } else {
            container.innerHTML = '<p class="no-denah-text">Belum ada denah yang diupload.</p>';
        }
    }
}
