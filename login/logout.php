<?php
session_start();
session_destroy();
header("Location: index.html"); // Redirige al usuario a la página de inicio de sesión
exit();
?>