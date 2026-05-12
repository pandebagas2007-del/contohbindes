<?php
/**
 * admin_auth.php — Autentikasi Admin Desa Muncan
 * 
 * Endpoint: POST /admin_auth.php
 * Body JSON: { "username": "...", "password": "..." }
 * Response:  { "success": true, "token": "...", "display_name": "..." }
 *            { "success": false, "message": "..." }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Ganti * dengan domain Anda di produksi

// ─── KONFIGURASI ADMIN ────────────────────────────────────────
// Ganti dengan username & password Anda yang kuat!
// Password disimpan sebagai hash bcrypt (bukan plaintext).
// Buat hash baru: php -r "echo password_hash('PASSWORD_ANDA', PASSWORD_BCRYPT);"
$ADMIN_CREDENTIALS = [
    [
        'username'     => 'admin',
        'password_hash'=> '$2y$12$ExampleHashReplaceThisWithRealHash.xxxxxxxxxxxxxxxxxxxxxx',
        'display_name' => 'Admin Desa Muncan',
    ],
    // Tambahkan akun admin lain di sini jika perlu
];

// Durasi token sesi (dalam detik). Default: 8 jam.
$TOKEN_LIFETIME = 8 * 3600;

// File penyimpanan token sesi (di luar public_html lebih aman)
$SESSION_FILE = __DIR__ . '/data/sessions.json';
// ─────────────────────────────────────────────────────────────

// ─── HANYA TERIMA POST ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ─── BACA BODY ───────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username dan password wajib diisi.']);
    exit;
}

// ─── VERIFIKASI KREDENSIAL ───────────────────────────────────
$matchedUser = null;
foreach ($ADMIN_CREDENTIALS as $cred) {
    if ($cred['username'] === $username && password_verify($password, $cred['password_hash'])) {
        $matchedUser = $cred;
        break;
    }
}

if (!$matchedUser) {
    // Delay untuk mencegah brute force
    sleep(1);
    echo json_encode(['success' => false, 'message' => 'Username atau password salah.']);
    exit;
}

// ─── BUAT TOKEN ──────────────────────────────────────────────
$token   = bin2hex(random_bytes(32));
$expires = time() + $TOKEN_LIFETIME;

// Simpan sesi ke file
if (!is_dir(dirname($SESSION_FILE))) {
    mkdir(dirname($SESSION_FILE), 0755, true);
}
$sessions = [];
if (file_exists($SESSION_FILE)) {
    $sessions = json_decode(file_get_contents($SESSION_FILE), true) ?? [];
}
// Hapus sesi kadaluarsa
$sessions = array_filter($sessions, fn($s) => $s['expires'] > time());
// Tambah sesi baru
$sessions[$token] = [
    'username'     => $username,
    'display_name' => $matchedUser['display_name'],
    'expires'      => $expires,
];
file_put_contents($SESSION_FILE, json_encode($sessions), LOCK_EX);

echo json_encode([
    'success'      => true,
    'token'        => $token,
    'display_name' => $matchedUser['display_name'],
    'expires_at'   => date('c', $expires),
]);
