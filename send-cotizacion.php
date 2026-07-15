<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    'success' => false,
    'message' => 'Método no permitido.'
  ]);
  exit;
}

/* =========================
   CONFIGURACIÓN
   ========================= */

$to = 'marketing@impoex.ec';
$fromEmail = 'no-reply@impoex.ec';
$fromName = 'Web Grupo IMPOEX';

/* =========================
   FUNCIONES
   ========================= */

function clean_text($value) {
  $value = trim((string)$value);
  $value = str_replace(["\r", "\n"], ' ', $value);
  return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function clean_multiline($value) {
  $value = trim((string)$value);
  return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/* =========================
   ANTISPAM SIMPLE
   ========================= */

$honeypot = $_POST['website'] ?? '';

if (!empty($honeypot)) {
  echo json_encode([
    'success' => true,
    'message' => 'Solicitud recibida correctamente.'
  ]);
  exit;
}

/* =========================
   DATOS DEL FORMULARIO
   ========================= */

$nombre   = clean_text($_POST['nombre'] ?? '');
$empresa  = clean_text($_POST['empresa'] ?? '');
$correo   = trim((string)($_POST['correo'] ?? ''));
$telefono = clean_text($_POST['telefono'] ?? '');
$servicio = clean_text($_POST['servicio'] ?? '');
$urgencia = clean_text($_POST['urgencia'] ?? '');
$mensaje  = clean_multiline($_POST['mensaje'] ?? '');

if ($nombre === '' || $correo === '') {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => 'Por favor completa nombre y correo electrónico.'
  ]);
  exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => 'El correo electrónico no es válido.'
  ]);
  exit;
}

/* Evita inyección en cabeceras */
$correoSeguro = str_replace(["\r", "\n"], '', $correo);

$fecha = date('d/m/Y H:i:s');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'No disponible';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'No disponible';

$subject = 'Nueva solicitud de cotización - Web IMPOEX';

$body = "
Nueva solicitud recibida desde la web de Grupo IMPOEX

==============================
DATOS DEL CONTACTO
==============================

Nombre: {$nombre}
Empresa: {$empresa}
Correo: {$correoSeguro}
Teléfono: {$telefono}

==============================
DETALLE DE LA SOLICITUD
==============================

Servicio de interés: {$servicio}
Nivel de urgencia: {$urgencia}

Mensaje:
{$mensaje}

==============================
INFORMACIÓN TÉCNICA
==============================

Fecha: {$fecha}
IP: {$ip}
Navegador: {$userAgent}
";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';
$headers[] = 'Reply-To: ' . $nombre . ' <' . $correoSeguro . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
  echo json_encode([
    'success' => true,
    'message' => 'Tu solicitud fue enviada correctamente. Nuestro equipo se pondrá en contacto contigo.'
  ]);
} else {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'No se pudo enviar la solicitud en este momento. Inténtalo nuevamente o escríbenos a marketing@impoex.ec.'
  ]);
}