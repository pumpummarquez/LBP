<?php
require 'conexion.php';

function verificarDisponibilidad($idRecurso, $FechaSolicitud, $Num_bloque) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM Solicitud WHERE Recurso_idRecurso = :recurso AND FechaSolicitud = :fecha AND Num_bloque = :bloque");
    $stmt->bindParam(':recurso', $idRecurso);
    $stmt->bindParam(':fecha', $FechaSolicitud);
    $stmt->bindParam(':bloque', $Num_bloque);
    $stmt->execute();
    $count = $stmt->fetchColumn();
    return $count > 0; // Devuelve true si el bloque está ocupado, false si está libre
}
?>