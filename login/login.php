<?php
session_start(); // Inicia la sesión

// Incluye el archivo de conexión
require_once("conexion.php");

// Verifica si se han enviado el usuario y la contraseña
if (isset($_POST['usuario']) && isset($_POST['password'])) {
    $usuario = $_POST['usuario'];
    $password = $_POST['password']; // ¡Nunca almacenes contraseñas en texto plano!  Usa password_hash y password_verify.

    try {
        // Consulta la base de datos para verificar el usuario y la contraseña
        $stmt = $conexion->prepare("SELECT idFuncionario, contrasena FROM Funcionario WHERE idFuncionario = :usuario"); //Suponiendo que el idFuncionario es el usuario
        $stmt->bindParam(':usuario', $usuario);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($resultado && password_verify($password, $resultado['contrasena'])) { //Usar password_verify
            // Generar un token único
            $token = bin2hex(random_bytes(32));

            // Guardar el token en la sesión
            $_SESSION['token'] = $token;
            $_SESSION['usuario_id'] = $resultado['idFuncionario']; // Guarda el ID del usuario en la sesión
            $_SESSION['ultimo_acceso'] = time(); // Guarda el tiempo del último acceso

             // Insertar el acceso en la tabla Acceso
            $stmtAcceso = $conexion->prepare("INSERT INTO Acceso (Fecha, Hora, Funcionario_idFuncionario) VALUES (CURDATE(), NOW(), :funcionario_id)");
            $stmtAcceso->bindParam(':funcionario_id',  $resultado['idFuncionario']);
            $stmtAcceso->execute();

            echo "success"; // Devuelve "success" para que JavaScript redireccione
        } else {
            echo "error"; // Devuelve "error" para indicar que el inicio de sesión falló
        }
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage(); // Devuelve el mensaje de error de la base de datos
    }
} else {
    echo "error"; // Devuelve "error" si no se han enviado el usuario y la contraseña
}
?>