<?php
require 'conexion.php'; // Asegúrate de que este archivo establece $pdo correctamente

// Recibe los datos JSON del frontend
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

header('Content-Type: application/json'); // Configurar el encabezado de respuesta JSON

if ($data && is_array($data)) {
    // Validar que existan las claves necesarias en los datos recibidos
    if (isset($data['fecha_solicitud'], $data['num_bloque'], $data['idFuncionario'], $data['idRecurso'])) {

        $fechaSolicitud = $data['fecha_solicitud'];
        $numBloque = $data['num_bloque'];
        $idFuncionario = $data['idFuncionario'];
        $idRecurso = $data['idRecurso'];

        // Paso 1: Verificar si ya existe una solicitud con la misma fecha, bloque y recurso
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM solicitud WHERE FechaSolicitud = :fecha AND Num_bloque = :bloque AND Recurso_idRecurso = :recurso_id");
        $checkStmt->bindParam(':fecha', $fechaSolicitud);
        $checkStmt->bindParam(':bloque', $numBloque);
        $checkStmt->bindParam(':recurso_id', $idRecurso);
        $checkStmt->execute();
        $count = $checkStmt->fetchColumn(); // Obtiene el número de filas que coinciden

        if ($count > 0) {
            // Si count es mayor que 0, significa que ya existe una solicitud con esa combinación
            $response = array('success' => false, 'message' => 'Este recurso ya ha sido solicitado para esta fecha y bloque.');
        } else {
            // Si count es 0, no existe colisión, proceder con la inserción
            // Paso 2: Preparar la consulta SQL para insertar
            $insertStmt = $pdo->prepare("INSERT INTO solicitud (FechaSolicitud, Num_bloque, `Status`, Funcionario_idFuncionario, Recurso_idRecurso) VALUES (:fecha, :bloque, '1', :funcionario_id, :recurso_id)");

            // Enlazar los valores a los marcadores de posición para la inserción
            $insertStmt->bindParam(':fecha', $fechaSolicitud);
            $insertStmt->bindParam(':bloque', $numBloque);
            $insertStmt->bindParam(':funcionario_id', $idFuncionario);
            $insertStmt->bindParam(':recurso_id', $idRecurso);

            // Ejecuta la consulta de inserción
            if ($insertStmt->execute()) {
                // La inserción fue exitosa
                $response = array('success' => true, 'message' => 'Solicitud guardada correctamente.');
            } else {
                // Hubo un error en la inserción (puede ser un error de base de datos distinto a la colisión ya verificada)
                // En un entorno de producción, podrías querer loggear este error para depuración.
                $response = array('success' => false, 'message' => 'Error al guardar la solicitud en la base de datos.');
            }
        }
    } else {
        // Si faltan datos necesarios en el JSON
        $response = array('success' => false, 'message' => 'Datos incompletos recibidos.');
    }
} else {
    // Si no se recibieron datos JSON válidos o el formato es incorrecto
    $response = array('success' => false, 'message' => 'No se recibieron datos válidos o el formato es incorrecto.');
}
// Devuelve la respuesta JSON al frontend
echo json_encode($response);
?>