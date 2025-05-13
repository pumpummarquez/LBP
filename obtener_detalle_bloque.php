<?php
require 'conexion.php'; // Asegúrate de que este archivo contiene la conexión PDO

header('Content-Type: application/json'); // Indicar que la respuesta es JSON

// Permitir solicitudes desde tu frontend (cambiar si es necesario)
header("Access-Control-Allow-Origin: *"); // Considerar restringir esto en producción
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Verificar si se recibieron los parámetros esperados
if (!isset($_GET['fecha']) || !isset($_GET['num_bloque'])) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Faltan parámetros (fecha o num_bloque)."]);
    exit();
}

$fecha = $_GET['fecha'];
$num_bloque = $_GET['num_bloque'];

try {
    // Consulta para obtener todas las solicitudes para una fecha y bloque dados
    // Unimos con las tablas Recurso y Funcionario para obtener descripciones y nombres
    $sql = "SELECT
                s.idSolicitud,
                s.FechaSolicitud,
                s.Num_bloque,
                r.idRecurso,
                r.Descrip_Recurso,
                f.idFuncionario,
                f.NombreFuncionario,
                f.ApellidoFuncionario
            FROM
                Solicitud s
            JOIN
                Recurso r ON s.Recurso_idRecurso = r.idRecurso
            JOIN
                Funcionario f ON s.Funcionario_idFuncionario = f.idFuncionario
            WHERE
                s.FechaSolicitud = :fecha AND s.Num_bloque = :num_bloque";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':fecha', $fecha);
    $stmt->bindParam(':num_bloque', $num_bloque, PDO::PARAM_INT);
    $stmt->execute();

    $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Si no hay solicitudes para esa fecha y bloque, devolver un array vacío
    if (!$solicitudes) {
        echo json_encode([]);
    } else {
        echo json_encode($solicitudes);
    }

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Error inesperado: " . $e->getMessage()]);
}
?>