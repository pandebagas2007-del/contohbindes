# 🗺️ Panduan Deploy — Website Desa Muncan

## Struktur File

```
/
├── index.html          ← Halaman utama
├── style.css           ← Semua styling
├── script.js           ← Semua JavaScript
├── admin_auth.php      ← Backend: login admin
├── upload.php          ← Backend: upload denah
├── get_denah.php       ← Backend: ambil denah aktif
├── uploads/
│   └── denah/          ← Folder penyimpanan gambar denah (auto-buat)
└── data/               ← Data JSON sesi & metadata (auto-buat)
    ├── sessions.json
    └── denah_aktif.json
```

---

## 🔧 Langkah Setup

### 1. Upload semua file ke hosting
Upload seluruh file ke folder public di hosting Anda (biasanya `public_html/`).

### 2. Buat password hash untuk admin

Jalankan perintah ini di server (via SSH atau PHP shell):

```bash
php -r "echo password_hash('PASSWORD_ANDA_DISINI', PASSWORD_BCRYPT) . PHP_EOL;"
```

Contoh output:
```
$2y$12$AbCdEfGhIjKlMnOpQrStUuVwXyZ0123456789AbCdEfGhIjKlMn12
```

### 3. Edit admin_auth.php

Buka `admin_auth.php`, temukan bagian `KONFIGURASI ADMIN` dan isi:

```php
$ADMIN_CREDENTIALS = [
    [
        'username'      => 'namaadmin',         // ← Ganti ini
        'password_hash' => '$2y$12$...',         // ← Tempel hash dari langkah 2
        'display_name'  => 'Admin Desa Muncan',  // ← Nama yang tampil
    ],
];
```

### 4. Buat folder data & uploads

Pastikan folder berikut ada dan bisa ditulis oleh server:

```bash
mkdir -p uploads/denah data
chmod 755 uploads uploads/denah data
```

Atau buat manual lewat File Manager hosting.

### 5. Hapus Development Mode dari script.js

Buka `script.js`, cari komentar `// ── DEVELOPMENT MODE ──` dan hapus blok tersebut (ada 2 tempat: di fungsi `doLogin()` dan `uploadDenah()`).

### 6. Ganti CORS origin (opsional, rekomendasi)

Di ketiga file PHP, ganti:
```php
header('Access-Control-Allow-Origin: *');
```
Menjadi:
```php
header('Access-Control-Allow-Origin: https://domainanda.com');
```

---

## 🔐 Cara Login Admin

1. Buka website
2. Klik tombol **Admin ↗** di navbar kanan atas
3. Masukkan username dan password
4. Setelah masuk, klik area upload atau seret gambar denah
5. Klik **Upload ke Server**

Sesi admin aktif selama **8 jam** (bisa diubah di `admin_auth.php` → `$TOKEN_LIFETIME`).

---

## 🖼️ Format Denah yang Didukung

| Format | Ekstensi |
|--------|----------|
| JPEG   | .jpg, .jpeg |
| PNG    | .png |
| WebP   | .webp |
| GIF    | .gif |

Ukuran maksimal: **10MB**

---

## ⚠️ Keamanan

- Password **tidak pernah disimpan plaintext** — selalu gunakan bcrypt hash
- Token sesi kadaluarsa otomatis setelah 8 jam
- File upload divalidasi dari MIME type asli (bukan hanya ekstensi)
- Folder `data/` sebaiknya diproteksi dari akses publik:

Buat file `.htaccess` di dalam folder `data/`:
```apache
Deny from all
```

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Login gagal terus | Pastikan `$SESSION_FILE` bisa ditulis server |
| Upload gagal | Cek permission folder `uploads/denah/` (chmod 755) |
| Denah tidak muncul | Cek URL di `get_denah.php`, pastikan path benar |
| Error CORS | Ganti `*` dengan domain Anda di header PHP |

---

## 📞 Kontak

Website: Desa Muncan, Kecamatan Selat, Kabupaten Karangasem, Bali  
© 2026 Desa Muncan
