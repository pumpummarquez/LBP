<?php

function obtenerEmailFuncionario($funcionarioId) {
    global $pdo; // Asegúrate de que $pdo esté disponible
    if (!isset($pdo)) {
        require 'conexion.php';
    }
    $stmt = $pdo->prepare("SELECT email FROM funcionario WHERE id = :id");
    $stmt->bindParam(':id', $funcionarioId, PDO::PARAM_INT);
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    return $resultado['email'] ?? null;
}

function enviarEmail($destinatario, $asunto, $cuerpo, $funcionarioIdRemitente) {
    $emailRemitente = obtenerEmailFuncionario($funcionarioIdRemitente);

    if (!$emailRemitente) {
        error_log("No se encontró el correo electrónico del funcionario con ID: " . $funcionarioIdRemitente);
        return false;
    }

    $nombreRemitente = $_SESSION['NombreFuncionario'] . " " . $_SESSION['ApellidoFuncionario'] ?? 'Sistema de Solicitudes'; // Puedes obtener el nombre también de la sesión o de la BD

    $cabeceras = "From: " . $nombreRemitente . " <" . $emailRemitente . ">\r\n";
    $cabeceras .= "Reply-To: " . $emailRemitente . "\r\n";
    $cabeceras .= "Content-Type: text/html; charset=UTF-8\r\n";
    $cabeceras .= "X-Mailer: PHP/" . phpversion();

    $resultado = mail($destinatario, $asunto, $cuerpo, $cabeceras);

    if ($resultado) {
        return true; // Correo enviado correctamente
    } else {
        error_log("Error al enviar el correo a: " . $destinatario . " con asunto: " . $asunto);
        return false; // Error al enviar el correo
    }
}

// Si usas PHPMailer, la lógica sería similar dentro de la función enviarEmailPHPMailer
/*
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

function obtenerEmailFuncionarioPHPMailer($funcionarioId) {
    global $pdo;
    if (!isset($pdo)) {
        require 'conexion.php';
    }
    $stmt = $pdo->prepare("SELECT email, nombre, apellido FROM funcionario WHERE id = :id");
    $stmt->bindParam(':id', $funcionarioId, PDO::PARAM_INT);
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    return $resultado ?? null;
}

function enviarEmailPHPMailer($destinatario, $asunto, $cuerpo, $funcionarioIdRemitente) {
    $infoRemitente = obtenerEmailFuncionarioPHPMailer($funcionarioIdRemitente);

    if (!$infoRemitente) {
        error_log("No se encontró información del funcionario con ID: " . $funcionarioIdRemitente . " para el remitente del correo.");
        return false;
    }

    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor SMTP (igual que antes)
        $mail->isSMTP();
        $mail->Host       = 'smtp.example.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'tu_usuario_smtp';
        $mail->Password   = 'tu_contraseña_smtp';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        // Remitente y destinatario
        $mail->setFrom($infoRemitente['email'], $infoRemitente['nombre'] . ' ' . $infoRemitente['apellido']);
        $mail->addAddress($destinatario);

        // Contenido del correo
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = $cuerpo;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Error al enviar el correo: {$mail->ErrorInfo}");
        return false;
    }
}
*/

?>