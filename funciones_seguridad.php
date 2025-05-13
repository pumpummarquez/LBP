<?php
function generarCodigo2FA($longitud = 6, $incluir_especiales = false) {
    $caracteres_numericos = '0123456789';
    $caracteres_minusculas = 'abcdefghijklmnopqrstuvwxyz';
    $caracteres_mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $caracteres_especiales = '!@#$%^&*()_+=-`~[]\{}|;\':",./<>?'; // Añade los caracteres especiales que desees

    $caracteres = $caracteres_numericos . $caracteres_minusculas . $caracteres_mayusculas;

    if ($incluir_especiales) {
        $caracteres .= $caracteres_especiales;
    }

    $codigo = '';
    $max = strlen($caracteres) - 1;
    for ($i = 0; $i < $longitud; $i++) {
        $indice = rand(0, $max);
        $codigo .= $caracteres[$indice];
    }
    return $codigo;
}



function almacenarCodigo2FA($funcionarioId, $codigo) {
    global $pdo; // Asegúrate de que $pdo esté disponible en este ámbito (conexión a la base de datos)
    if (!isset($pdo)) {
        require 'conexion.php'; // Si la conexión no está establecida, inclúyela aquí
    }
    $stmt = $pdo->prepare("INSERT INTO codigos_2fa (funcionario_id, codigo, creado_en) VALUES (:funcionario_id, :codigo, NOW())");
    $stmt->bindParam(':funcionario_id', $funcionarioId, PDO::PARAM_INT);
    $stmt->bindParam(':codigo', $codigo, PDO::PARAM_STR);
    return $stmt->execute();
}

function verificarCodigo2FA($funcionarioId, $codigo) {
    global $pdo; // Asegúrate de que $pdo esté disponible
    if (!isset($pdo)) {
        require 'conexion.php';
    }
    $stmt = $pdo->prepare("SELECT id FROM codigos_2fa WHERE funcionario_id = :funcionario_id AND codigo = :codigo AND creado_en > DATE_SUB(NOW(), INTERVAL 15 MINUTE) ORDER BY creado_en DESC LIMIT 1");
    $stmt->bindParam(':funcionario_id', $funcionarioId, PDO::PARAM_INT);
    $stmt->bindParam(':codigo', $codigo, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function eliminarCodigo2FA($codigoId) {
    global $pdo; // Asegúrate de que $pdo esté disponible
    if (!isset($pdo)) {
        require 'conexion.php';
    }
    $stmt = $pdo->prepare("DELETE FROM codigos_2fa WHERE id = :id");
    $stmt->bindParam(':id', $codigoId, PDO::PARAM_INT);
    return $stmt->execute();
}

?>