<?php
require 'conexion.php';
    $stmt = $pdo->prepare("SELECT idRecurso, Descrip_Recurso FROM recurso");
    $stmt->execute();
    $recursos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($recursos);
?>