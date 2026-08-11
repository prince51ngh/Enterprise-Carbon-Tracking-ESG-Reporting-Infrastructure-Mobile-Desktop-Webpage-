<?php
/* ═══════════════════════════════════════════════════════════════
   estimator.php — Carbon Estimator API Backend
   Receives POST request, calculates emission metrics, and stores in database
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

$monthly_power_kwh = isset($input['monthly_power_kwh']) ? floatval($input['monthly_power_kwh']) : -1;
$fleet_miles       = isset($input['fleet_miles']) ? floatval($input['fleet_miles']) : -1;

// ── Validation ──
$errors = [];

if ($monthly_power_kwh < 0) {
    $errors[] = 'Monthly power (kWh) must be a positive number.';
}
if ($fleet_miles < 0) {
    $errors[] = 'Fleet miles must be a positive number.';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['message' => implode(' ', $errors), 'errors' => $errors]);
    exit;
}

// ── Emission Factors ──
$ELECTRICITY_FACTOR = 0.42;   // kg CO₂ per kWh
const FLEET_FACTOR  = 0.404;  // kg CO₂ per mile

$elecCO2    = $monthly_power_kwh * $ELECTRICITY_FACTOR;
$fleetCO2   = $fleet_miles * FLEET_FACTOR;
$computedCO2 = round($elecCO2 + $fleetCO2, 2);

// ── Insert into database ──
try {
    $stmt = $pdo->prepare('INSERT INTO estimates (monthly_power_kwh, fleet_miles, total_co2_kg) VALUES (?, ?, ?)');
    $stmt->execute([$monthly_power_kwh, $fleet_miles, $computedCO2]);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Estimate recorded successfully.',
        'id' => $pdo->lastInsertId(),
        'data' => [
            'monthly_power_kwh' => $monthly_power_kwh,
            'fleet_miles' => $fleet_miles,
            'electricity_co2_kg' => round($elecCO2, 2),
            'fleet_co2_kg' => round($fleetCO2, 2),
            'total_co2_kg' => $computedCO2
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to save to database: ' . $e->getMessage()]);
}
?>
