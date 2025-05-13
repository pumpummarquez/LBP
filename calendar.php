<?php

require_once 'vendor/autoload.php'; // Autocargador de Composer

// Configuración de la API de Google (reemplaza con tus credenciales)
$client = new Google_Client();
$client->setApplicationName('Tu Aplicación de Solicitud de Salas');
$client->setAuthConfig('path/to/your/credentials.json'); // Archivo JSON de tus credenciales
$client->setScopes(Google_Service_Calendar::CALENDAR_EVENTS);
$client->setAccessType('offline'); // Para obtener un refresh token y tener acceso incluso cuando el usuario no está presente
$client->setPrompt('consent'); // Para forzar la solicitud de consentimiento la primera vez

// Inicia la sesión (si aún no está iniciada)
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Redirige al usuario a la página de autorización de Google si no tiene un token de acceso
if (!isset($_SESSION['access_token'])) {
    $authUrl = $client->createAuthUrl();
    header('Location: ' . filter_var($authUrl, FILTER_SANITIZE_URL));
    exit();
} else {
    $client->setAccessToken($_SESSION['access_token']);
}

// Si se recibe el código de autorización de Google
if (isset($_GET['code'])) {
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    if (!isset($token['error'])) {
        $_SESSION['access_token'] = $token;
        $client->setAccessToken($token);
    } else {
        // Manejar el error al obtener el token
        echo '<p>Ocurrió un error al obtener el token de acceso.</p>';
        error_log('Error al obtener el token de acceso: ' . json_encode($token));
        exit();
    }
}

// Crea una instancia del servicio de Google Calendar
$service = new Google_Service_Calendar($client);

/**
 * Función para agregar un evento al Google Calendar de un usuario
 *
 * @param Google_Service_Calendar $service Servicio de Google Calendar
 * @param string $calendarId El ID del calendario (generalmente 'primary' para el calendario principal del usuario)
 * @param string $summary Título del evento
 * @param string $description Descripción del evento
 * @param string $startDateTime Fecha y hora de inicio (formato RFC3339)
 * @param string $endDateTime Fecha y hora de fin (formato RFC3339)
 * @param string|null $timeZone Zona horaria (opcional, por defecto la del usuario)
 * @return Google_Service_Calendar_Event|null El evento creado o null en caso de error
 */
function agregarEventoACalendario(Google_Service_Calendar $service, string $calendarId, string $summary, string $description, string $startDateTime, string $endDateTime, ?string $timeZone = null): ?Google_Service_Calendar_Event
{
    $event = new Google_Service_Calendar_Event(array(
        'summary' => $summary,
        'description' => $description,
        'start' => array(
            'dateTime' => $startDateTime,
            'timeZone' => $timeZone ?? 'America/Santiago', // Puedes ajustar la zona horaria por defecto
        ),
        'end' => array(
            'dateTime' => $endDateTime,
            'timeZone' => $timeZone ?? 'America/Santiago',
        ),
        'reminders' => array(
            'useDefault' => false,
            'overrides' => array(
                array('method' => 'popup', 'minutes' => 30), // Recordatorio 30 minutos antes
            ),
        ),
    ));

    try {
        $createdEvent = $service->events->insert($calendarId, $event);
        return $createdEvent;
    } catch (Google_Service_Exception $e) {
        error_log('Error al crear el evento en Google Calendar: ' . $e->getMessage());
        return null;
    }
}

// Ejemplo de cómo usar la función cuando se procesa una solicitud de sala
if (isset($_POST['solicitar_sala'])) {
    $profesorEmail = $_POST['profesor_email']; // Necesitarás el email del profesor para identificar su calendario (si es diferente al principal)
    $nombreSala = $_POST['nombre_sala'];
    $fechaSolicitud = $_POST['fecha_solicitud'];
    $horaInicio = $_POST['hora_inicio'];
    $horaFin = $_POST['hora_fin'];
    $motivo = $_POST['motivo'];

    // Formatea las fechas y horas al formato RFC3339 (ejemplo: 2025-04-10T14:30:00-03:00)
    $startDateTime = date('Y-m-d\TH:i:sP', strtotime("$fechaSolicitud $horaInicio"));
    $endDateTime = date('Y-m-d\TH:i:sP', strtotime("$fechaSolicitud $horaFin"));

    $summary = "Reserva de Sala: $nombreSala";
    $description = "Sala reservada para: $motivo";

    // Llama a la función para agregar el evento
    $eventoCreado = agregarEventoACalendario(
        $service,
        'primary', // O el ID del calendario del profesor si lo tienes
        $summary,
        $description,
        $startDateTime,
        $endDateTime
    );

    if ($eventoCreado) {
        echo '<p>Se ha creado un recordatorio en tu Google Calendar.</p>';
        // Redirigir o mostrar un mensaje de éxito
    } else {
        echo '<p>Ocurrió un error al crear el recordatorio en Google Calendar.</p>';
        // Mostrar un mensaje de error
    }
}

// Formulario de ejemplo (esto estaría en tu frontend)
?>
<!DOCTYPE html>
<html>
<head>
    <title>Solicitud de Sala</title>
</head>
<body>
    <?php if (!isset($_SESSION['access_token'])): ?>
        <p><a href="<?php echo filter_var($client->createAuthUrl(), FILTER_SANITIZE_URL); ?>">Conectar con Google Calendar</a></p>
    <?php else: ?>
        <h2>Solicitar Sala</h2>
        <form method="post">
            <label for="profesor_email">Email del Profesor:</label><br>
            <input type="email" id="profesor_email" name="profesor_email" value="profesor@example.com" required><br><br>
            <label for="nombre_sala">Nombre de la Sala:</label><br>
            <input type="text" id="nombre_sala" name="nombre_sala" value="Sala de Reuniones 1" required><br><br>
            <label for="fecha_solicitud">Fecha de Solicitud:</label><br>
            <input type="date" id="fecha_solicitud" name="fecha_solicitud" value="<?php echo date('Y-m-d'); ?>" required><br><br>
            <label for="hora_inicio">Hora de Inicio:</label><br>
            <input type="time" id="hora_inicio" name="hora_inicio" value="09:00" required><br><br>
            <label for="hora_fin">Hora de Fin:</label><br>
            <input type="time" id="hora_fin" name="hora_fin" value="10:00" required><br><br>
            <label for="motivo">Motivo de la Solicitud:</label><br>
            <textarea id="motivo" name="motivo"></textarea><br><br>
            <input type="submit" name="solicitar_sala" value="Solicitar Sala y Agregar a Calendar">
        </form>
    <?php endif; ?>
</body>
</html>