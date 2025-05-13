<?php
session_start(); // Asegúrate de iniciar la sesión al principio del script
// Incluye el archivo de conexión
$host = 'localhost';
$dbname = 'reservas';
$dbuser = 'root';
$dbpass = '';
try {
    $conexion = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $dbuser, $dbpass);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
    exit; // Detener la ejecución si no hay conexión
}

// Función para limpiar y prevenir ataques XSS
function limpiar_entrada($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

if (isset($_POST['usuario1']) && isset($_POST['password1'])) {
    // Limpiar la entrada del usuario para prevenir XSS
    $usuario1 = limpiar_entrada($_POST['usuario1']);
    $password1 = $_POST['password1'];

    try {

        // Consulta la base de datos para verificar el usuario
        $stmt = $conexion->prepare("SELECT idFuncionario, contrasena, NombreFuncionario, ApellidoFuncionario  FROM funcionario WHERE idFuncionario = :usuario1");
        $stmt->bindParam(':usuario1', $usuario1); // Usar el nombre de variable correcto
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($resultado && password_verify($password1, $resultado['contrasena'])) {
            // Generar un token único y seguro
            $token = bin2hex(random_bytes(32));

            // Guardar el token y otra información relevante en la sesión
            $_SESSION['token'] = $token;
            $_SESSION['usuario_id'] = $resultado['idFuncionario'];
            $_SESSION['NombreFuncionario'] = $resultado['NombreFuncionario'];
            $_SESSION['ApellidoFuncionario'] = $resultado['ApellidoFuncionario'];
            $_SESSION['ultimo_acceso'] = time();

            // Insertar el acceso en la tabla Acceso
            $stmtAcceso = $conexion->prepare("INSERT INTO Acceso (Fecha, Hora, Funcionario_idFuncionario) VALUES (CURDATE(), NOW(), :funcionario_id)");
            $stmtAcceso->bindParam(':funcionario_id', $resultado['idFuncionario']);
            $stmtAcceso->execute();

            echo "success"; // Devuelve "success" para que JavaScript redireccione
        } else {
            echo "error"; // Devuelve "error" si las credenciales son incorrectas
        }

    } catch (PDOException $e) {
        echo "Error de base de datos: " . $e->getMessage(); // Devuelve un mensaje de error más específico
    }
} else {
    echo "error si no se enviaron usuario y contraseña"; // Devuelve "error" si no se enviaron usuario y contraseña
}
?>