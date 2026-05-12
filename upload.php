<?php
/**
 * upload.php — Upload Denah Desa Muncan
 * 
 * Endpoint: POST /upload.php  (multipart/form-data)
 * Fields:   denah = file gambar, token = admin token
 * Response: { "success": true, "url": "...", "filename": "...", "uploaded_at": "..." }
 *           { "success": false, "message": "..." }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Ganti * dengan domain Anda

// ─── KONFIGURASI ─────────────────────────────────────────────
$SESSION_FILE    = __DIR__ . '/data/sessions.json';
$DENAH_DIR       = __DIR__ . '/uploads/denah/';
$DENAH_META_FILE = __DIR__ . '/data/denah_aktif.json';
$MAX_SIZE        = 10 * 1024 * 1024; // 10MB
$ALLOWED_TYPES   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$ALLOWED_EXTS    = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
// ─────────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ─── VALIDASI TOKEN ──────────────────────────────────────────
$token = $_POST['token'] ?? '';
if (empty($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token tidak valid.']);
    exit;
}

$sessions = json_decode(file_get_contents($SESSION_FILE), true) ?? [];
if (!isset($sessions[$token]) || $sessions[$token]['expires'] < time()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Sesi telah berakhir. Silakan login ulang.']);
    exit;
}

// ─── VALIDASI FILE ───────────────────────────────────────────
if (!isset($_FILES['denah']) || $_FILES['denah']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'File tidak diterima atau terjadi error upload.']);
    exit;
}

$file     = $_FILES['denah'];
$mimeType = mime_content_type($file['tmp_name']); // validasi MIME asli
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($mimeType, $ALLOWED_TYPES)) {
    echo json_encode(['success' => false, 'message' => 'Tipe file tidak diizinkan.']);
    exit;
}
if (!in_array($ext, $ALLOWED_EXTS)) {
    echo json_encode(['success' => false, 'message' => 'Ekstensi file tidak diizinkan.']);
    exit;
}
if ($file['size'] > $MAX_SIZE) {
    echo json_encode(['success' => false, 'message' => 'Ukuran file melebihi 10MB.']);
    exit;
}

// ─── SIMPAN FILE ─────────────────────────────────────────────
if (!is_dir($DENAH_DIR)) {
    mkdir($DENAH_DIR, 0755, true);
}

// Nama file unik: denah_TIMESTAMP.ext
$newFilename = 'denah_' . time() . '.' . $ext;
$destPath    = $DENAH_DIR . $newFilename;

// Hapus denah lama jika ada
$existingMeta = [];
if (file_exists($DENAH_META_FILE)) {
    $existingMeta = json_decode(file_get_contents($DENAH_META_FILE), true) ?? [];
    if (!empty($existingMeta['filename'])) {
        $oldPath = $DENAH_DIR . $existingMeta['filename'];
        if (file_exists($oldPath)) unlink($oldPath);
    }
}

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file di server.']);
    exit;
}

// ─── SIMPAN METADATA ─────────────────────────────────────────
$uploadedAt = date('c');
$relativeUrl = 'uploads/denah/' . $newFilename;

$meta = [
    'filename'    => $newFilename,
    'url'         => $relativeUrl,
    'uploaded_by' => $sessions[$token]['username'],
    'uploaded_at' => $uploadedAt,
    'filesize'    => $file['size'],
];

if (!is_dir(dirname($DENAH_META_FILE))) {
    mkdir(dirname($DENAH_META_FILE), 0755, true);
}
file_put_contents($DENAH_META_FILE, json_encode($meta, JSON_PRETTY_PRINT), LOCK_EX);

echo json_encode([
    'success'     => true,
    'url'         => $relativeUrl,
    'filename'    => $newFilename,
    'uploaded_at' => $uploadedAt,
]);
