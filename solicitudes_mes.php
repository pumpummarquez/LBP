<?php
require 'conexion.php';

function verificarDisponibilidad($fecha_ini,$fecha_fin) {
    global $pdo;
    global $solicitudes;
    $stmt = $pdo->prepare("SELECT s.FechaSolicitud, s.Num_bloque, r.Descrip_Recurso, p.NombreProfesor, p.ApellidoProfesor AS FechaSolicitud, Num_bloque, Descrip_Recurso, NombreProfesor, ApellidoProfesor
    FROM solicitud s JOIN recurso r ON s.Recurso_idRecurso = r.idRecurso JOIN profesor p ON s.Profesor_idProfesor = p.idProfesor
    WHERE (s.FechaSolicitud >= $fecha_ini AND s.FechaSolicitud <= $fecha_fin)
    ORDER BY s.FechaSolicitud, s.Num_bloque");
   // $stmt->bindParam(':idRecurso', $idRecurso); // No se usa en la WHERE actual
  //  $stmt->bindParam(':Descrip_Recurso', $Descrip_Recurso); // No se usa en la WHERE actual
   // $stmt->bindParam(':FechaSolicitud', $FechaSolicitud); // No se usa en la WHERE actual
    //$stmt->bindParam(':Num_bloque', $Num_bloque); // No se usa en la WHERE actual
    //$stmt->bindParam(':NombreProfesor', $NombreProfesor); // No se usa en la WHERE actual
    //$stmt->bindParam(':ApellidoProfesor', $ApellidoProfesor); // No se usa en la WHERE actual
    $stmt->execute();
    $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($solicitudes);

}
?>