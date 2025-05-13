<?php
$host = 'localhost'; // Cambia esto si tu servidor MySQL está en otro lugar
$dbname = 'reservas'; // Reemplaza con el nombre de tu base de datos
$usuario = 'root'; // Reemplaza con tu usuario de MySQL
$contrasena = ''; // Reemplaza con tu contraseña de MySQL

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usuario, $contrasena);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error al conectar a la base de datos: " . $e->getMessage());
}
?>