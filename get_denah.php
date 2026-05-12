<?php
/**
 * get_denah.php — Ambil Info Denah Aktif
 * 
 * Endpoint: GET /get_denah.php
 * Response: { "success": true, "url": "...", "filename": "...", "uploaded_at": "..." }
 *           { "success": false }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Ganti * dengan domain Anda
header('Cache-Control: no-cache');

$DENAH_META_FILE = __DIR__ . '/data/denah_aktif.json';

if (!file_exists($DENAH_META_FILE)) {
    echo json_encode(['success' => false]);
    exit;
}

$meta = json_decode(file_get_contents($DENAH_META_FILE), true);

// Periksa apakah file fisiknya masih ada
$filePath = __DIR__ . '/uploads/denah/' . ($meta['filename'] ?? '');
if (empty($meta['url']) || !file_exists($filePath)) {
    echo json_encode(['success' => false]);
    exit;
}

echo json_encode([
    'success'     => true,
    'url'         => $meta['url'],
    'filename'    => $meta['filename'],
    'uploaded_at' => $meta['uploaded_at'] ?? null,
    'uploaded_by' => $meta['uploaded_by'] ?? null,
]);
