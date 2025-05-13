<?php
session_start();

// Verifica si el usuario ha iniciado sesión y el token existe
if (!isset($_SESSION['usuario_id']) || !isset($_SESSION['token'])) {
    header("Location: index.html"); // Redirige al inicio de sesión si no hay sesión
    exit();
}

// Verifica la inactividad
$tiempo_inactividad_maximo = 600; // 10 minutos en segundos (10 * 60)
if (time() - $_SESSION['ultimo_acceso'] > $tiempo_inactividad_maximo) {
    session_destroy();
    header("Location: index.html");
    exit();
}

// Actualiza el tiempo del último acceso
$_SESSION['ultimo_acceso'] = time();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grilla Dinámica con Click en Celdas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="estilos.css" rel="stylesheet">
    <style>
        .grid-container {
            display: grid;
            grid-template-columns: repeat(9, 1fr); /* 9 columnas */
            gap: 5px; /* Espacio entre celdas */
        }
        .grid-item {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
            cursor: pointer; /* Indicar que la celda es clickable */
        }
        .day-column {
            font-weight: bold;
        }
        .weekend {
            background-color: #e0f7fa; /* Celeste claro */
        }
    </style>
    <style>
        /* Estilos básicos para el nuevo modal - puedes ajustarlos */
        .modal {
            display: none; /* Oculto por defecto */
            position: fixed; /* Posición fija */
            z-index: 1; /* Va por encima de otros elementos */
            left: 0;
            top: 0;
            width: 100%; /* Ancho completo */
            height: 100%; /* Altura completa */
            overflow: auto; /* Habilitar scroll si es necesario */
            background-color: rgb(0,0,0); /* Color de fondo oscuro */
            background-color: rgba(0,0,0,0.4); /* Oscuridad con transparencia */
            padding-top: 60px;
        }

        .modal-content {
            background-color: #fefefe;
            margin: 5% auto; /* 15% desde arriba y centrado */
            padding: 20px;
            border: 1px solid #888;
            width: 80%; /* Ancho del modal */
            max-width: 700px; /* Ancho máximo */
            position: relative;
        }

        .cerrar-modal {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }

        .cerrar-modal:hover,
        .cerrar-modal:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }

        /* Estilos para la grilla dentro del modal */
        .detalle-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Columnas responsivas */
            gap: 10px;
        }

        .detalle-item {
            border: 1px solid #eee;
            padding: 10px;
            background-color: #f9f9f9;
        }

        .detalle-recurso-titulo {
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 3px;
        }
        </style>
</head>
<body>

    <div class="container mt-4">
        <div class="mb-3">
            <label for="monthSelector" class="form-label">Selecciona un mes:</label>
            <select class="form-select" id="monthSelector">
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
            </select>
        </div>

        <div id="gridContainer" class="grid-container">
        </div>
    </div>
    
    
<div id="modal-solicitud" class="modal">
    <div class="modal-content">
        <span class="cerrar-modal">&times;</span>
        <h2>Solicitar Recurso</h2>
        <form id="formulario-solicitud">
            <div class="form-group">
                <label for="nombre_funcionario">Funcionario:</label>
                <input type="text" id="idFuncionario" style="display: none;" value="<?php echo  $_SESSION['usuario_id']?>" readonly>
                <input type="text" id="NombreFuncionario" value="<?php echo  $_SESSION['NombreFuncionario']." ".$_SESSION['ApellidoFuncionario']  ?>" readonly>
                <input type="text" id="rolFuncionario" style="display: none;" value="<?php echo  $_SESSION['idTipo_funcionario']?>" readonly>
            </div>
            <div class="form-group">
                <label for="fecha_solicitada">Fecha:</label>
                <input type="text" id="fecha_solicitada" readonly>
            </div>
            <div class="form-group">
                <label for="bloque_solicitado">Bloque:</label>
                <input type="text" id="bloque_solicitado" readonly>
            </div>
            <div class="form-group">
                <label for="idRecurso">Seleccionar Recurso:</label>
                <select class="form-select" id="idRecurso" name="idRecurso">
                    <option value="" disabled selected>Seleccione un recurso</option>
                </select>
            </div>
            <div class="botones-modal row gx-2">
                <div class="col-auto">
                    <button type="button" id="btn-eliminar" class="btn btn-danger">Eliminar</button>
                </div>
                <div class="col-auto">
                    <button type="submit" class="btn btn-primary">Enviar Solicitud</button>
                </div>
                <div class="col-auto">
                    <button type="button" id="btn-cancelar" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        </form>
    </div>
</div>    
<div id="modal-detalle-recursos" class="modal">
    <div class="modal-content">
        <span class="cerrar-modal" onclick="document.getElementById('modal-detalle-recursos').style.display='none';">&times;</span>
        <h2>Recursos Ocupados para esta Fecha y Bloque</h2>
        <p>Fecha: <span id="detalle-fecha"></span></p>
        <p>Bloque: <span id="detalle-bloque"></span></p>
        <div id="detalle-grid-container" class="container mt-3">
            </div>
        <div class="modal-footer mt-3">
            <button type="button" id="btn-solicitar-otro" class="btn btn-primary me-2">Solicitar otro recurso</button>
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-detalle-recursos').style.display='none';">Cerrar</button>
        </div>
    </div>
</div>

<div id="modal-confirmacion-2fa" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="cerrar-modal" onclick="modalConfirmacion2FA.style.display='none';">&times;</span>
        <h3>Verificación de Seguridad</h3>
        <p id="mensaje-2fa"></p>
        <div class="form-group">
            <label for="codigo-2fa">Código de Verificación:</label>
            <input type="text" id="codigo-2fa" class="form-control">
        </div>
        <button id="btn-verificar-codigo" class="btn btn-primary">Verificar Código</button>
    </div>
</div>
<script src="mi_carga.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
</body>
</html>