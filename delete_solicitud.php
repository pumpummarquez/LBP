<?php
session_start(); // Inicia la sesión para acceder a $_SESSION

// Verifica si el usuario ha iniciado sesión y tiene un ID de funcionario
if (!isset($_SESSION['usuario_id'])) {
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Usuario no autenticado.'));
    exit();
}

// Verifica la inactividad (opcional, pero buena práctica si ya lo tienes)
$tiempo_inactividad_maximo = 600; // 10 minutos en segundos (10 * 60)
if (isset($_SESSION['ultimo_acceso']) && (time() - $_SESSION['ultimo_acceso'] > $tiempo_inactividad_maximo)) {
    session_unset();
    session_destroy();
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Sesión expirada por inactividad. Por favor, inicie sesión de nuevo.'));
    exit();
}
$_SESSION['ultimo_acceso'] = time(); // Actualiza el tiempo del último acceso

require 'conexion.php'; // Asegúrate de que este archivo establece $pdo correctamente

// Recibe los datos JSON del frontend
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

header('Content-Type: application/json'); // Configurar el encabezado de respuesta JSON

if ($data && isset($data['idSolicitud'])) {
    $idSolicitudToDelete = $data['idSolicitud'];
    $currentUserId = $_SESSION['usuario_id'];
    $currentUserRole = $_SESSION['rol']; // Asegúrate de que el rol del usuario se guarda en la sesión

    // Paso 1: Verificar si la solicitud existe y obtener su propietario
    $checkStmt = $pdo->prepare("SELECT Funcionario_idFuncionario FROM solicitud WHERE idSolicitud = :idSolicitud");
    $checkStmt->bindParam(':idSolicitud', $idSolicitudToDelete);
    $checkStmt->execute();
    $solicitud = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$solicitud) {
        // La solicitud no existe
        $response = array('success' => false, 'message' => 'La solicitud especificada no fue encontrada.');
    } else {
        $propietarioId = $solicitud['Funcionario_idFuncionario'];

        // Paso 2: Verificar si el usuario actual es el propietario o un administrador
        // Asegúrate de que 'administrador' es el valor correcto del rol en tu base de datos/sesión
        if ($currentUserId == $propietarioId || $currentUserRole == 'administrador') { // <--- AJUSTA 'administrador' al valor real de tu rol de admin
            // Usuario autorizado, proceder con la eliminación
            try {
                // Iniciar una transacción por si acaso (buena práctica para operaciones sensibles)
                $pdo->beginTransaction();

                $deleteStmt = $pdo->prepare("DELETE FROM solicitud WHERE idSolicitud = :idSolicitud");
                $deleteStmt->bindParam(':idSolicitud', $idSolicitudToDelete);

                if ($deleteStmt->execute()) {
                    // Eliminación exitosa
                    $pdo->commit(); // Confirmar la transacción
                    $response = array('success' => true, 'message' => 'Solicitud eliminada correctamente.');
                } else {
                    // Error en la ejecución del DELETE
                     $pdo->rollBack(); // Revertir la transacción
                    $response = array('success' => false, 'message' => 'Error al eliminar la solicitud en la base de datos.');
                }
            } catch (PDOException $e) {
                 $pdo->rollBack(); // Revertir la transacción en caso de excepción
                 // En un entorno de producción, loggear $e->getMessage() en lugar de mostrarlo directamente
                $response = array('success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage());
            }

        } else {
            // Usuario no autorizado
            $response = array('success' => false, 'message' => 'No tiene permisos para eliminar esta solicitud.');
        }
    }

} else {
    // Si no se recibió el idSolicitud o datos JSON válidos
    $response = array('success' => false, 'message' => 'Datos de eliminación inválidos.');
}

// Devuelve la respuesta JSON al frontend
echo json_encode($response);
?>