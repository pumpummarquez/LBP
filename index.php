<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
 <meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ingreso a Solicitud de Recursos</title>
<script src="js/jquery.min.js" type="text/javascript"></script>

<link href="fonts/OleoScript-Regular.ttf" rel="stylesheet"/>
</head>

    <style>
        @font-face{
            font-family:fuentechida;
            src: url(fonts/OleoScript-Regular.ttf);
        }
        body{
            background-image: url(imagenes/Marco.jpg);
            background-attachment: fixed;
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
        }
        fieldset{
            transition: 2s;
            margin-bottom: 30px; /* Reduje un poco el margen inferior */
            border-color: rgb(57, 0, 213);
            border-style: groove;
            border-width: 5px;
            border-radius: 20px;
            padding: 20px; /* Añadí padding al fieldset para que los elementos no estén tan pegados al borde */
        }
        .login{
            width: 40%;
            transition: 2s;
            border-radius: 10px;
            box-shadow: 0px 0px 40px blue,0px 0px 80px white;
            padding: 20px;
        }
        .logo{
            height: 90px;
            margin-top: 15px;
            margin-bottom: 25px; /* Aumenté un poco el margen inferior del logo */
        }
        h3,h4{
            color:blue;
            text-align: center;
            font-size: 1.5em;
            margin-bottom: 15px;
        }
        legend{
            border: none;
            margin-bottom: 10px; /* Añadí un poco de margen inferior a la leyenda */
        }
        .form-group{
            text-align: center; /* Centramos el contenido dentro del form-group */            
        }
        .Imput{
            transition: 0.8s;
            background-color: rgba(0,0,0,.5);
            color: white;
            border-color: #006;
            border-bottom-color: white;
            border-bottom-style: groove;
            border-left: none;
            border-right: none;
            border-top: none;
            border-width: 6px;
            padding: 10px 25px; /* Aumenté el padding horizontal para que se vea más centrado */
            font-size: 1.2em;
            display: block; /* Para que el width funcione correctamente */
            margin: 10px auto; /* Centrado horizontal usando márgenes automáticos */
            width: 80%; /* Reduje el ancho para que se vea más centrado */
        }
        .Imput:hover{
            transition: 0.8s;
            background-color: rgba(55,71,79,.5);
            box-shadow: inset;
            border-bottom-color: blue;
        }
        @media screen and (max-width:750px){
            .login{
                width: 95%;
                padding: 15px;
            }
            .logo{
                height: 70px;
                margin-bottom: 20px;
            }
            h3,h4{
                font-size: 1.2em;
            }
            .Imput{
                font-size: 1em;
                padding: 8px 20px;
                width: 90%;
            }
        }
        .container_login {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .btn-azul-personalizado {
            padding: 10px 20px;
            font-size: 1.2em;
            display: block; /* Para que el margin auto funcione */
            margin: 20px auto 0; /* Centramos el botón y le damos un margen superior */
            width: 50%; /* Reducimos el ancho del botón para que se vea más acorde */
            background-color: #007bff; /* Un tono de azul común */
            border-color: #007bff;
            color: white;
        }

        .btn-azul-personalizado:hover { /* Opcional: estilo al pasar el ratón */
            background-color: #0056b3;
            border-color: #0056b3;
        }
    </style>

<body>
        <div id="container_login" class="container_login">
            <div class="login">
                <div class="row">
                    <div class="col-xs-12 text-center">
                        <img src="imagenes/ICON/avataresMH.png" class="logo">
                    </div>
                </div>
                <div class="row">
                    <fieldset class="col-xs-12">
                        <legend class="hidden-xs"><h3 style="font-size: 1.8em;">Inicio de Sesi&oacute;n</h3></legend>
                        <form class="form-horizontal" id="login-form">
                            <div class="form-group">
                                <label class="col-xs-12 text-center" for="usuario1"><h4 style="font-size: 1.5em;">Usuario</h4></label>
                                <div class="col-xs-12">
                                    <input type="text" id="usuario1" name="usuario1" class="form-comtrol Imput" onkeypress="return soloEnterosPositivos(event);" maxlength="9" onblur="validarMaximo(this);">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-xs-12 text-center" for="password1"><h4 style="font-size: 1.5em;">Password</h4></label>
                                <div class="col-xs-12">
                                    <input type="password" id="password1" name="password1" class="form-comtrol Imput" onfocus="validarCampoNumero();">
                                </div>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn btn-azul-personalizado center-block">Aceptar</button>
                            </div>
                        </form>                        
                    </fieldset>
                </div>
            </div>
        </div>
        <script type="text/javascript">
            $(document).ready(function() {
                $('#login-form').submit(function(event) {
                    event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional

                    var usuario1 = $('#usuario1').val();
                    var password1 = $('#password1').val();

                    $.ajax({
                        url: 'login.php', // El archivo PHP que procesará el inicio de sesión
                        type: 'POST',
                        data: { usuario1: usuario1, password1: password1 }, // Envía los datos del formulario
                        success: function(response) {
                            if (response === 'success') {
                                window.location.href = 'tercera.php'; // Redirige al usuario si el inicio de sesión es exitoso
                            } else if (response === 'error') {
                                alert('Usuario o contraseña incorrectos.'); // Muestra un mensaje de error
                            } else {
                                alert('Error: ' + response); // Muestra un mensaje de error
                            }
                        },
                        error: function(xhr, status, error) {
                            alert('Error al realizar la petición: ' + error); // Muestra un mensaje de error si la petición AJAX falla
                        }
                    });
                });
            });

            function soloEnterosPositivos(event) {
                var charCode = (event.which) ? event.which : event.keyCode;

                // Permitir solo dígitos del 0 al 9
                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                    return false;
                }

                // No permitir el signo menos (-) ni el punto decimal (.)
                if (charCode === 45 || charCode === 46) {
                    return false;
                }

                // Si se presiona Enter
                if (charCode === 13) {
                    alert("paso ak");
                    event.preventDefault(); // Evitar la acción predeterminada del Enter (submit si es el único campo)
                    var siguienteInput = document.activeElement.nextElementSibling;
                    while (siguienteInput && siguienteInput.tagName !== 'INPUT') {
                        
                        siguienteInput = siguienteInput.nextElementSibling;
                    }
                    if (siguienteInput) {
                        siguienteInput.focus();
                    }
                    return false; // Para evitar que se ingrese un Enter en el campo
                }

                return true;
                }

                function validarMaximo(inputElement) {
                var valor = parseInt(inputElement.value, 10);
                if (!isNaN(valor) && valor >= 120000000) {
                    alert("El valor ingresado debe ser menor a 120,000,000.");
                    inputElement.value = "";
                    inputElement.focus();
                }
                }

                function validarCampoNumero() {
                var inputNumero = document.getElementById("usuario");
                var valor = parseInt(inputNumero.value, 10);

                if (isNaN(valor) || inputNumero.value === "" || valor === 0 || valor >= 120000000) {
                    var mensaje = "";
                    if (inputNumero.value === "") {
                    mensaje = "El campo número está vacío.";
                    } else if (isNaN(valor) || valor === 0) {
                    mensaje = "El campo número debe contener un valor mayor a 0.";
                    } else if (valor >= 120000000) {
                    mensaje = "El valor ingresado en el campo número supera el límite de 120,000,000.";
                    }
                    alert(mensaje);
                    inputNumero.focus(); // Devolver el foco al campo número
                    return false; // Indica que la validación falló
                }
                return true; // Indica que la validación fue exitosa
            }
        </script>
</body>
</html>