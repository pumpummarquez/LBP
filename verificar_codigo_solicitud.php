<?php
require 'conexion.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $funcionario_id = $_POST['funcionario_id'] ?? '';
    $codigo_ingresado = $_POST['codigo_2fa'] ?? '';

    // Sanitizar y validar las entradas
    $funcionario_id = filter_var($funcionario_id, FILTER_SANITIZE_NUMBER_INT);
    $codigo_ingresado = filter_var($codigo_ingresado, FILTER_SANITIZE_STRING);

    if (empty($funcionario_id) || empty($codigo_ingresado)) {
        echo json_encode(['error' => 'El ID del funcionario y el código son obligatorios.']);
        exit();
    }

    // Buscar el código 2FA válido para este funcionario (y que no haya expirado)
    $stmt = $pdo->prepare("SELECT * FROM codigos_2fa WHERE funcionario_id = :funcionario_id AND codigo = :codigo AND creado_en > DATE_SUB(NOW(), INTERVAL 15 MINUTE) ORDER BY creado_en DESC LIMIT 1");
    $stmt->bindParam(':funcionario_id', $funcionario_id, PDO::PARAM_INT);
    $stmt->bindParam(':codigo', $codigo_ingresado, PDO::PARAM_STR);
    $stmt->execute();
    $codigo_db = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($codigo_db) {
        // Código válido, ahora puedes marcar la solicitud como confirmada
        // (Necesitarías el ID de la solicitud aquí, podrías pasarlo también o almacenarlo temporalmente)
        // Por ahora, simplemente respondemos con éxito
        echo json_encode(['success' => 'Código de verificación correcto. Solicitud confirmada.']);

        // Opcional: Eliminar el código ya utilizado
        $stmtEliminar = $pdo->prepare("DELETE FROM codigos_2fa WHERE id = :id");
        $stmtEliminar->bindParam(':id', $codigo_db['id'], PDO::PARAM_INT);
        $stmtEliminar->execute();

    } else {
        echo json_encode(['error' => 'Código de verificación incorrecto o ha expirado.']);
    }

} else {
    echo json_encode(['error' => 'Método de solicitud no válido.']);
}
?>