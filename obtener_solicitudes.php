<?php
require 'conexion.php';

// Puedes agregar parámetros para filtrar por fecha o recurso si es necesario
$stmt = $pdo->prepare("SELECT s.Funcionario_idFuncionario, s.idSolicitud, s.FechaSolicitud, s.Num_bloque,s.Recurso_idRecurso, r.Descrip_Recurso
                       FROM solicitud s
                       JOIN recurso r ON s.Recurso_idRecurso = r.idRecurso
                       JOIN funcionario p ON s.Funcionario_idFuncionario = p.idFuncionario
                       ORDER BY s.FechaSolicitud, s.Num_bloque");
$stmt->execute();
$solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($solicitudes);
?>