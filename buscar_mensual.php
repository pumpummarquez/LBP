<?php
require 'conexion.php'; // Asegúrate de que este archivo establece $pdo correctamente

// Función para obtener todas las solicitudes dentro de un rango de fechas
function obtenerSolicitudesMensuales($fecha_ini, $fecha_fin, $pdo) {
    $stmt = $pdo->prepare("
        SELECT
            s.Funcionario_idFuncionario,
            s.idSolicitud,
            s.FechaSolicitud,
            s.Num_bloque,
            s.Recurso_idRecurso,
            r.idRecurso,
            r.Descrip_Recurso,
            p.NombreFuncionario,
            p.ApellidoFuncionario,
            p.Tipo_funcionario_idTipo_funcionario, 
            q.idTipo_funcionario, 
            q.Descrip_tipofun
        FROM
            solicitud s
        JOIN
            recurso r ON s.Recurso_idRecurso = r.idRecurso
        JOIN
            funcionario p ON s.Funcionario_idFuncionario = p.idFuncionario
        JOIN
            tipo_funcionario q ON q.idTipo_funcionario = p.Tipo_funcionario_idTipo_funcionario 
        WHERE
            s.FechaSolicitud >= :fecha_ini AND s.FechaSolicitud <= :fecha_fin
        ORDER BY
            s.FechaSolicitud,
            s.Num_bloque
    ");
    $stmt->bindParam(':fecha_ini', $fecha_ini);
    $stmt->bindParam(':fecha_fin', $fecha_fin);

    // Añadir manejo básico de errores para la ejecución de la consulta
    try {
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Retornar el resultado como array asociativo
    } catch (PDOException $e) {
        // En un entorno de producción, loggear el error en lugar de mostrarlo directamente
        // error_log("Database error in buscar_mensual.php: " . $e->getMessage());
        // Para depuración en desarrollo podrías mostrar el mensaje, pero no en producción por seguridad.
        // echo "Database error: " . $e->getMessage(); // Descomentar solo para depuración
        return null; // Indicar que hubo un error
    }
}

header('Content-Type: application/json'); // Configurar el encabezado JSON siempre

// Verificar si se reciben los parámetros GET y llamar a la función
if (isset($_GET['fecha_ini']) && isset($_GET['fecha_fin'])) {
    $fecha_inicio = $_GET['fecha_ini'];
    $fecha_final = $_GET['fecha_fin'];

    // Llamar a la función y obtener el resultado
    $solicitudes = obtenerSolicitudesMensuales($fecha_inicio, $fecha_final, $pdo);

    // Devolver el resultado o un array vacío/mensaje de error si la consulta falló
    if ($solicitudes !== null) {
         echo json_encode($solicitudes);
    } else {
         // Manejar el error de la base de datos, devolviendo un error JSON
         echo json_encode(array('success' => false, 'message' => 'Error al obtener datos de la base de datos.'));
    }

} else {
    // Manejar el caso en que no se reciben los parámetros, devolviendo un error JSON
    echo json_encode(array('success' => false, 'message' => 'Parámetros de fecha faltantes.'));
}
?>