<?php
/**
 * PassPrivé Travel — Persistent Bookings & Leads API (v3.0.0)
 * Stores and manages real customer bookings, manual bookings, lifecycle stages,
 * and supplier booking status (Booked vs Not Booked).
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/../data';
$storageFile = $dataDir . '/bookings.json';
$htaccessFile = $dataDir . '/.htaccess';

// Ensure data directory exists and is secured from public web crawling
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}
if (!file_exists($htaccessFile)) {
    file_put_contents($htaccessFile, "Order deny,allow\nDeny from all\n");
}

// Ensure bookings file exists
if (!file_exists($storageFile)) {
    file_put_contents($storageFile, json_encode([], JSON_PRETTY_PRINT));
}

function readBookings($storageFile) {
    if (!file_exists($storageFile)) return [];
    $content = file_get_contents($storageFile);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function writeBookings($storageFile, $data) {
    $fp = fopen($storageFile, 'c+');
    if ($fp && flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }
    return false;
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Return All Bookings ──
if ($method === 'GET') {
    $bookings = readBookings($storageFile);
    echo json_encode([
        'success' => true,
        'count' => count($bookings),
        'bookings' => $bookings
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// ── POST: Create New Booking / Lead ──
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $now = date('Y-m-d H:i:s');
    $datePart = date('Ymd');
    $randomPart = rand(100, 999);
    $refId = !empty($input['refId']) ? trim($input['refId']) : "PPTRV-{$datePart}-{$randomPart}";

    $total = isset($input['total']) ? intval($input['total']) : 0;
    $tokenPaid = isset($input['tokenPaid']) ? intval($input['tokenPaid']) : 0;
    $balance = isset($input['balance']) ? intval($input['balance']) : max(0, $total - $tokenPaid);

    $newBooking = [
        'refId' => $refId,
        'createdAt' => $now,
        'guest' => !empty($input['guest']) ? trim($input['guest']) : 'Guest',
        'phone' => !empty($input['phone']) ? trim($input['phone']) : '',
        'email' => !empty($input['email']) ? trim($input['email']) : '',
        'destination' => !empty($input['destination']) ? trim($input['destination']) : 'Mauritius',
        'pkg' => !empty($input['pkg']) ? trim($input['pkg']) : 'Customized Mauritius Plan',
        'travelDate' => !empty($input['travelDate']) ? trim($input['travelDate']) : date('Y-m-d', strtotime('+30 days')),
        'duration' => !empty($input['duration']) ? trim($input['duration']) : '5 Nights · 6 Days',
        'total' => $total,
        'tokenPaid' => $tokenPaid,
        'balance' => $balance,
        'comfortDate' => !empty($input['comfortDate']) ? trim($input['comfortDate']) : 'Pending Call',
        'cutoffDate' => !empty($input['cutoffDate']) ? trim($input['cutoffDate']) : date('Y-m-d', strtotime('+22 days')),
        'cutoffBufferHours' => 48,
        'stage' => !empty($input['stage']) ? trim($input['stage']) : 'NEW_LEAD',
        'isBookedWithSupplier' => !empty($input['isBookedWithSupplier']) ? true : false,
        'supplierBookingRef' => !empty($input['supplierBookingRef']) ? trim($input['supplierBookingRef']) : '',
        'supplierNotes' => !empty($input['supplierNotes']) ? trim($input['supplierNotes']) : '',
        'source' => !empty($input['source']) ? trim($input['source']) : 'WhatsApp Click',
        'inclusions' => !empty($input['inclusions']) && is_array($input['inclusions']) ? $input['inclusions'] : []
    ];

    $bookings = readBookings($storageFile);
    // Add to beginning of array
    array_unshift($bookings, $newBooking);

    if (writeBookings($storageFile, $bookings)) {
        echo json_encode([
            'success' => true,
            'message' => 'Booking created successfully',
            'refId' => $refId,
            'booking' => $newBooking
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Storage write failure']);
        exit;
    }
}

// ── PUT: Update Existing Booking (Lifecycle Stage, Supplier Booking Status, Notes) ──
if ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (!$input || empty($input['refId'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Booking refId is required for update']);
        exit;
    }

    $refId = trim($input['refId']);
    $bookings = readBookings($storageFile);
    $foundIndex = -1;

    for ($i = 0; $i < count($bookings); $i++) {
        if ($bookings[$i]['refId'] === $refId) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Booking not found']);
        exit;
    }

    // Editable fields
    if (isset($input['stage'])) {
        $bookings[$foundIndex]['stage'] = trim($input['stage']);
    }
    if (isset($input['isBookedWithSupplier'])) {
        $bookings[$foundIndex]['isBookedWithSupplier'] = (bool)$input['isBookedWithSupplier'];
    }
    if (isset($input['supplierBookingRef'])) {
        $bookings[$foundIndex]['supplierBookingRef'] = trim($input['supplierBookingRef']);
    }
    if (isset($input['supplierNotes'])) {
        $bookings[$foundIndex]['supplierNotes'] = trim($input['supplierNotes']);
    }
    if (isset($input['comfortDate'])) {
        $bookings[$foundIndex]['comfortDate'] = trim($input['comfortDate']);
    }
    if (isset($input['tokenPaid'])) {
        $bookings[$foundIndex]['tokenPaid'] = intval($input['tokenPaid']);
        $bookings[$foundIndex]['balance'] = max(0, $bookings[$foundIndex]['total'] - $bookings[$foundIndex]['tokenPaid']);
    }
    if (isset($input['total'])) {
        $bookings[$foundIndex]['total'] = intval($input['total']);
        $bookings[$foundIndex]['balance'] = max(0, $bookings[$foundIndex]['total'] - $bookings[$foundIndex]['tokenPaid']);
    }
    if (isset($input['guest'])) {
        $bookings[$foundIndex]['guest'] = trim($input['guest']);
    }
    if (isset($input['phone'])) {
        $bookings[$foundIndex]['phone'] = trim($input['phone']);
    }

    $bookings[$foundIndex]['updatedAt'] = date('Y-m-d H:i:s');

    if (writeBookings($storageFile, $bookings)) {
        echo json_encode([
            'success' => true,
            'message' => "Booking {$refId} updated successfully",
            'booking' => $bookings[$foundIndex]
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Storage write failure']);
        exit;
    }
}

// ── DELETE: Delete Booking ──
if ($method === 'DELETE') {
    $refId = isset($_GET['refId']) ? trim($_GET['refId']) : '';
    if (!$refId) {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);
        if ($input && !empty($input['refId'])) {
            $refId = trim($input['refId']);
        }
    }

    if (!$refId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'refId required']);
        exit;
    }

    $bookings = readBookings($storageFile);
    $filtered = array_values(array_filter($bookings, function($b) use ($refId) {
        return $b['refId'] !== $refId;
    }));

    if (writeBookings($storageFile, $filtered)) {
        echo json_encode([
            'success' => true,
            'message' => "Booking {$refId} deleted successfully"
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Storage write failure']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
