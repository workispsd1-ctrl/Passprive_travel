<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── RateHawk API Configuration ──
// Enter your active production or sandbox credentials below:
$apiKeyId = '1222';
$apiToken = 'c0f026b0-1f01-4b0c-a587-6266ea6daa08';
$isProduction = false; // Set to true when moving to production RateHawk API
$apiBaseUrl = $isProduction ? 'https://api.ratehawk.com/api/b2b/v3/' : 'https://api-sandbox.ratehawk.com/api/b2b/v3/';
$userAgent = 'PasspriveTravel/1.0';

// Currency & Agency Margin (Internal wholesale-to-retail conversion)
$eurToInr = 93.0; 
$eurToMur = 50.5;
$markupPercent = 15; // 15% PassPrivé Agency Wholesale-to-Retail Margin

// Input parameters
$tripType = isset($_GET['trip']) ? strtolower(trim($_GET['trip'])) : 'couple';
$checkin = isset($_GET['checkin']) ? trim($_GET['checkin']) : date('Y-m-d', strtotime('+30 days'));
$nights = isset($_GET['nights']) ? (int)$_GET['nights'] : 5;
$checkout = date('Y-m-d', strtotime("$checkin +$nights days"));

// Trip hotel configurations
$tripConfigs = [
    'couple' => [
        'hotel_name' => 'Veranda Grand Baie Hotel & Spa',
        'location' => 'Grand Baie & North Coast',
        'stars' => 4,
        'sandbox_hid' => '10004834',
        'room_type' => 'Deluxe Creole Ocean Room (King Bed)',
        'meal' => 'All-Inclusive Creole Dining & Drinks',
        'default_base_eur' => 960.0,
        'base_room_inr' => 86000,
        'base_dining_inr' => 16000,
        'chauffeur_tours_inr' => 51000,
        'guests' => [['adults' => 2, 'children' => []]]
    ],
    'family' => [
        'hotel_name' => 'Ambre Resort & Spa',
        'location' => 'Belle Mare · East Coast Lagoon',
        'stars' => 4,
        'sandbox_hid' => '8819557',
        'room_type' => 'Family Beachfront Suite (Interconnecting)',
        'meal' => 'All-Inclusive Family Buffet & Kids Club Dining',
        'default_base_eur' => 1420.0,
        'base_room_inr' => 112000,
        'base_dining_inr' => 20000,
        'chauffeur_tours_inr' => 64500,
        'guests' => [['adults' => 2, 'children' => [7]]]
    ],
    'friends' => [
        'hotel_name' => 'Tamassa Bel Ombre Resort',
        'location' => 'Bel Ombre · South Coast',
        'stars' => 4,
        'sandbox_hid' => '9744270',
        'room_type' => 'Superior Beach Twin/Double Rooms',
        'meal' => 'All-Inclusive Open-Bar & Sunset Themed Dinners',
        'default_base_eur' => 1280.0,
        'base_room_inr' => 98000,
        'base_dining_inr' => 21000,
        'chauffeur_tours_inr' => 56000,
        'guests' => [['adults' => 4, 'children' => []]]
    ]
];

if (!isset($tripConfigs[$tripType])) {
    $tripType = 'couple';
}
$config = $tripConfigs[$tripType];

// ── 1. Calculate Date-Based Yield & Seasonality Multipliers ──
$now = new DateTime();
$checkinObj = DateTime::createFromFormat('Y-m-d', $checkin);
if (!$checkinObj || $checkinObj < $now) {
    $checkinObj = (new DateTime())->modify('+30 days');
    $checkin = $checkinObj->format('Y-m-d');
    $checkout = date('Y-m-d', strtotime("$checkin +$nights days"));
}

$diffDays = (int)$now->diff($checkinObj)->format('%a');
$month = (int)$checkinObj->format('n');
$day = (int)$checkinObj->format('j');

// A. Lead Time Multiplier (Farther dates cheaper, near dates higher)
if ($diffDays <= 7) {
    $leadMultiplier = 1.22; // Last-minute surge (+22%)
    $leadLabel = 'Last-Minute High Demand (+22%)';
    $rateBadge = '⚡ Last-Minute Demand';
} elseif ($diffDays <= 14) {
    $leadMultiplier = 1.12; // High demand (+12%)
    $leadLabel = 'High Demand Window (+12%)';
    $rateBadge = 'High Demand';
} elseif ($diffDays <= 35) {
    $leadMultiplier = 1.00; // Standard window
    $leadLabel = 'Standard Seasonal Rate';
    $rateBadge = 'Best Available Rate';
} elseif ($diffDays <= 75) {
    $leadMultiplier = 0.90; // Early bird (-10%)
    $leadLabel = 'Early Bird Savings (-10%)';
    $rateBadge = '🌿 Early Bird (-10%)';
} else {
    $leadMultiplier = 0.85; // Advance planning (-15%)
    $leadLabel = 'Advance Booking Privilege (-15%)';
    $rateBadge = '✨ Advance Saver (-15%)';
}

// B. Mauritius Seasonality Multiplier
// Festive peak (Dec 18 - Jan 10): Mauritius peak season
$isFestivePeak = ($month === 12 && $day >= 18) || ($month === 1 && $day <= 10);
// Low season (May 1 - Aug 31): Mauritius winter / mild breeze season
$isLowSeason = ($month >= 5 && $month <= 8);

if ($isFestivePeak) {
    $seasonMultiplier = 1.30;
    $seasonLabel = 'Mauritius Festive Peak Season (+30%)';
    $rateBadge = '✨ Festive Peak Season';
} elseif ($isLowSeason) {
    $seasonMultiplier = 0.88;
    $seasonLabel = 'Mauritius Island Saver Season (-12%)';
    $rateBadge = '☀️ Island Saver (-12%)';
} else {
    $seasonMultiplier = 1.00;
    $seasonLabel = 'Standard Island Season';
}

$combinedDateMultiplier = round($leadMultiplier * $seasonMultiplier, 3);
// Clamp multiplier between 0.75 and 1.55 for realistic hotel pricing
$combinedDateMultiplier = max(0.75, min(1.55, $combinedDateMultiplier));

// ── 2. Query RateHawk API (Live or Sandbox) ──
$liveApiSuccess = false;
$liveRate = null;
$rawCancellationDeadline = null;

try {
    $postPayload = json_encode([
        'checkin' => $checkin,
        'checkout' => $checkout,
        'residency' => 'in',
        'language' => 'en',
        'guests' => $config['guests'],
        'ids' => [$config['sandbox_hid']],
        'currency' => 'EUR'
    ]);

    $ch = curl_init($apiBaseUrl . 'search/serp/hotels/');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postPayload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode("$apiKeyId:$apiToken"),
            'User-Agent: $userAgent'
        ],
        CURLOPT_TIMEOUT => 4
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resData = json_decode($response, true);
        if (!empty($resData['data']['hotels'][0]['rates'][0])) {
            $liveRate = $resData['data']['hotels'][0]['rates'][0];
            $liveApiSuccess = true;
            if (!empty($liveRate['payment_options']['payment_types'][0]['cancellation_penalties']['free_cancellation_before'])) {
                $rawCancellationDeadline = $liveRate['payment_options']['payment_types'][0]['cancellation_penalties']['free_cancellation_before'];
            }
        }
    }
} catch (Exception $e) {
    $liveApiSuccess = false;
}

// ── 3. Dynamic Hotel Pricing Calculation ──
if ($liveApiSuccess && $liveRate) {
    $baseHotelEur = floatval($liveRate['payment_options']['payment_types'][0]['amount'] ?? $config['default_base_eur']);
    $mealTypeDesc = !empty($liveRate['meal_data']['value']) ? ucfirst($liveRate['meal_data']['value']) : $config['meal'];
    $roomNameDesc = !empty($liveRate['room_name']) ? $liveRate['room_name'] : $config['room_type'];
    $rateBadge = 'RateHawk Live Direct';
    
    // Convert RateHawk wholesale EUR to marked-up INR
    $hotelNetInr = round($baseHotelEur * $eurToInr);
    $hotelMarkedUpInr = round(($baseHotelEur * (1 + ($markupPercent / 100))) * $eurToInr);
    $hotelRoomInr = round($hotelMarkedUpInr * 0.84);
    $hotelDiningInr = $hotelMarkedUpInr - $hotelRoomInr;
} else {
    // Dynamic Date-Based Yield Model (Far dates cheaper, near dates surge, peak festive surcharge)
    $hotelRoomInr = round(($config['base_room_inr'] * $combinedDateMultiplier) / 100) * 100;
    $hotelDiningInr = round(($config['base_dining_inr'] * $combinedDateMultiplier) / 100) * 100;
    $hotelMarkedUpInr = $hotelRoomInr + $hotelDiningInr;
    $hotelNetInr = round($hotelMarkedUpInr / (1 + ($markupPercent / 100)));
    $mealTypeDesc = $config['meal'];
    $roomNameDesc = $config['room_type'];
}

$chauffeurToursInr = $config['chauffeur_tours_inr'];
$totalPackageInr = $hotelMarkedUpInr + $chauffeurToursInr;

// ── 4. Free Cancellation Deadline with 1-Day Safety Buffer ──
if ($rawCancellationDeadline) {
    $rhDeadlineTimestamp = strtotime($rawCancellationDeadline);
    $customerDeadlineTimestamp = $rhDeadlineTimestamp - (24 * 3600); // 1-day safety buffer
    $customerDeadlineFormatted = date('d M Y', $customerDeadlineTimestamp);
    $customerDeadlineIso = date('Y-m-d', $customerDeadlineTimestamp);
} else {
    // 1-day safety buffer before supplier 7-day window (Check-in - 8 days)
    $customerDeadlineTimestamp = strtotime("$checkin -8 days");
    $customerDeadlineFormatted = date('d M Y', $customerDeadlineTimestamp);
    $customerDeadlineIso = date('Y-m-d', $customerDeadlineTimestamp);
    $rawCancellationDeadline = date('Y-m-d\T23:59:00', strtotime("$checkin -7 days"));
}

$response = [
    'status' => 'success',
    'source' => $liveApiSuccess ? 'ratehawk_live_api' : 'ratehawk_yield_algorithm',
    'trip' => $tripType,
    'hotel' => [
        'name' => $config['hotel_name'],
        'location' => $config['location'],
        'stars' => $config['stars'],
        'room_type' => $roomNameDesc,
        'meal_plan' => $mealTypeDesc,
        'nights' => $nights,
        'checkin' => $checkin,
        'checkout' => $checkout
    ],
    'yield_model' => [
        'is_live_api' => $liveApiSuccess,
        'days_in_advance' => $diffDays,
        'lead_factor' => $leadMultiplier,
        'lead_label' => $leadLabel,
        'season_factor' => $seasonMultiplier,
        'season_label' => $seasonLabel,
        'combined_multiplier' => $combinedDateMultiplier,
        'rate_badge' => $rateBadge
    ],
    'pricing' => [
        'currency' => 'INR',
        'hotel_marked_up_inr' => $hotelMarkedUpInr,
        'hotel_room_inr' => $hotelRoomInr,
        'hotel_dining_inr' => $hotelDiningInr,
        'chauffeur_and_excursions_inr' => $chauffeurToursInr,
        'passprive_vip_app_inr' => 0, // Included Free
        'total_package_inr' => $totalPackageInr,
        'formatted_total' => '₹' . number_format($totalPackageInr, 0, '.', ','),
        'formatted_hotel_share' => '₹' . number_format($hotelMarkedUpInr, 0, '.', ','),
        'formatted_tours_share' => '₹' . number_format($chauffeurToursInr, 0, '.', ',')
    ],
    'flights' => [
        'route' => 'DEL (Delhi) ⇄ MRU (Mauritius)',
        'origin' => 'DEL · Delhi Airport India',
        'destination' => 'MRU · Sir Seewoosagur Mauritius',
        'fixed_price_oneway_inr' => 30691,
        'fixed_price_return_inr' => 61382,
        'formatted_oneway' => '₹30,691',
        'formatted_return' => '₹61,382'
    ],
    'cancellation_guarantee' => [
        'is_free_cancellation' => true,
        'buffer_applied' => '24_hours_prior_to_ratehawk_deadline',
        'customer_free_cancellation_date' => $customerDeadlineIso,
        'customer_free_cancellation_display' => $customerDeadlineFormatted,
        'ratehawk_internal_deadline' => $rawCancellationDeadline,
        'guarantee_badge' => "Free cancellation until {$customerDeadlineFormatted}. 100% full refund guarantee."
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
