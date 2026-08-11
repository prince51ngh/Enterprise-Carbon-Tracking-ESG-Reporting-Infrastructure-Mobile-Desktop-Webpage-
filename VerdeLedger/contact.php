<?php
/* ═══════════════════════════════════════════════════════════════
   contact.php — Contact Form API Backend
   Receives POST request, validates, and stores in MySQL contacts
   ═══════════════════════════════════════════════════════════════ */

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed.']);
    exit;
}

// Database credentials
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'verdeledger_db';

try {
    // Connect to MySQL
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid JSON input.']);
    exit;
}

$rep_name  = isset($input['rep_name']) ? trim($input['rep_name']) : '';
$rep_email = isset($input['rep_email']) ? trim($input['rep_email']) : '';
$phone     = isset($input['phone']) ? trim($input['phone']) : null;
$scope     = isset($input['scope']) ? trim($input['scope']) : '';
$details   = isset($input['details']) ? trim($input['details']) : '';

// ── Validation ──
$errors = [];

if (strlen($rep_name) < 2) {
    $errors[] = 'Representative name must be at least 2 characters.';
}

if (!filter_var($rep_email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}

if ($phone !== null && strlen($phone) > 0) {
    if (!preg_match('/^[\d\s\-\+\(\)]{7,20}$/', $phone)) {
        $errors[] = 'Phone number format is invalid.';
    }
}

$valid_scopes = ['carbon', 'finance', 'both'];
if (!in_array($scope, $valid_scopes)) {
    $errors[] = 'Please select a valid target objective.';
}

if (strlen($details) < 10) {
    $errors[] = 'Operational details must be at least 10 characters.';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['message' => implode(' ', $errors), 'errors' => $errors]);
    exit;
}

// ── Insert into database ──
try {
    $stmt = $pdo->prepare('INSERT INTO contacts (rep_name, rep_email, phone, scope, details) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$rep_name, $rep_email, $phone, $scope, $details]);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Contact submission received successfully.',
        'id' => $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to save to database: ' . $e->getMessage()]);
}
?>
