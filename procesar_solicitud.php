<?php
require 'conexion.php';
require 'verificar_disponibilidad.php';
require 'funciones_seguridad.php'; // Archivo para funciones de seguridad (generar código, etc.)
require 'funciones_email.php';    // Archivo para funciones de envío de correo

session_start(); // Asegúrate de tener la sesión iniciada

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_profesor = $_POST['idFuncionario'] ?? '';
    $id_recurso = $_POST['idRecurso'] ?? '';
    $fecha_solicitada = $_POST['fecha_solicitud'] ?? '';
    $numero_bloque = $_POST['num_bloque'] ?? '';
    $hash_recibido = $_POST['data_hash'] ?? '';

    // Sanitizar y validar las entradas (¡IMPRESCINDIBLE!)
    $id_profesor = filter_var($id_profesor, FILTER_SANITIZE_NUMBER_INT);
    $id_recurso = filter_var($id_recurso, FILTER_SANITIZE_NUMBER_INT);
    $fecha_solicitada = filter_var($fecha_solicitada, FILTER_SANITIZE_STRING);
    $numero_bloque = filter_var($numero_bloque, FILTER_SANITIZE_NUMBER_INT);

    if (empty($id_profesor) || empty($id_recurso) || empty($fecha_solicitada) || empty($numero_bloque) || empty($hash_recibido)) {
        echo json_encode(['error' => 'Todos los campos son obligatorios.']);
        exit();
    }

    $dataStringBackend = $fecha_solicitada . $numero_bloque . $id_profesor . $id_recurso;
    $hash_backend = hash('sha256', $dataStringBackend);

    if ($hash_backend !== $hash_recibido) {
        echo json_encode(['error' => 'Error de integridad de datos: Los valores del formulario han sido alterados.']);
        exit();
    }

    // Hash es válido, proceder con la generación del código 2FA
    $codigo_2fa = generarCodigo2FA(6); // Generar un código de 6 dígitos
    $funcionario_email = $_SESSION['funcionario_email'] ?? ''; // Asegúrate de tener el email en la sesión

    if (empty($funcionario_email)) {
        echo json_encode(['error' => 'No se encontró el correo electrónico del funcionario.']);
        exit();
    }

    // Almacenar temporalmente el código 2FA (necesitas implementar esta función)
    if (almacenarCodigo2FA($id_profesor, $codigo_2fa)) {
        // Enviar el correo electrónico con el código 2FA (necesitas implementar esta función)
        $asunto = 'Código de Verificación de Solicitud';
        $mensaje = "Se ha recibido una solicitud desde su cuenta. Por favor, ingrese el siguiente código para confirmarla: <b>" . $codigo_2fa . "</b>";

        if (enviarEmail($funcionario_email, $asunto, $mensaje)) {
            echo json_encode(['success_2fa' => true, 'message' => 'Código de verificación enviado al correo electrónico.']);
        } else {
            echo json_encode(['error' => 'Error al enviar el correo electrónico de verificación.']);
            // Opcional: Considera si debes continuar o detener el proceso aquí
        }
    } else {
        echo json_encode(['error' => 'Error al almacenar el código de verificación temporalmente.']);
    }

} else {
    echo json_encode(['error' => 'Método de solicitud no válido.']);
}

// Funciones de seguridad (en funciones_seguridad.php)
function generarCodigo2FA($longitud = 6) {
    $caracteres = '0123456789';
    $codigo = '';
    for ($i = 0; $i < $longitud; $i++) {
        $indice = rand(0, strlen($caracteres) - 1);
        $codigo .= $caracteres[$indice];
    }
    return $codigo;
}

function almacenarCodigo2FA($funcionarioId, $codigo) {
    global $pdo;
    $stmt = $pdo->prepare("INSERT INTO codigos_2fa (funcionario_id, codigo, creado_en) VALUES (:funcionario_id, :codigo, NOW())");
    $stmt->bindParam(':funcionario_id', $funcionarioId, PDO::PARAM_INT);
    $stmt->bindParam(':codigo', $codigo, PDO::PARAM_STR);
    return $stmt->execute();
}

// Funciones de email (en funciones_email.php - necesitarás implementar esto con PHPMailer o mail())
function enviarEmail($destinatario, $asunto, $cuerpo) {
    // Implementación del envío de correo electrónico aquí
    // Ejemplo básico con la función mail():
    $cabeceras = "From: tu_email@example.com\r\n";
    $cabeceras .= "Reply-To: tu_email@example.com\r\n";
    $cabeceras .= "Content-Type: text/html; charset=UTF-8\r\n";
    return mail($destinatario, $asunto, $cuerpo, $cabeceras);
}
?>