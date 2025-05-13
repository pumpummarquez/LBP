const modalSolicitud = document.getElementById('modal-solicitud');
const formularioSolicitud = document.getElementById('formulario-solicitud');
const fechaSolicitadaInput = document.getElementById('fecha_solicitada');
const bloqueSolicitadoInput = document.getElementById('bloque_solicitado');
const idFuncionarioInput = document.getElementById('idFuncionario');
const idRecursoInput = document.getElementById('idRecurso');
const cerrarModal = document.querySelector('.cerrar-modal');
const btnCancelar = document.getElementById('btn-cancelar');
const btnEliminar = document.getElementById('btn-eliminar'); // Asumiendo que solo aparece al editar una solicitud existente

const modalConfirmacion2FA = document.getElementById('modal-confirmacion-2fa');
const codigo2FAInput = document.getElementById('codigo-2fa');
const btnVerificarCodigo = document.getElementById('btn-verificar-codigo');
const mensaje2FA = document.getElementById('mensaje-2fa');
// Asumiendo que ya tienes una forma de obtener el nombre del profesor logueado
//document.getElementById('NombreFuncionario').value = NombreFuncionario;
// Agrega un event listener a cada celda del horario
const celdas = document.querySelectorAll('.mi-celda-de-horario'); // Reemplaza con tu selector de celdas
celdas.forEach(cell => {
    cell.addEventListener('click', () => {
        
        const fechaCelda = cell.dataset.fecha;
        const bloqueCelda = cell.dataset.bloque;

        // Llena los campos ocultos del formulario con la información de la celda
        fechaSolicitadaInput.value = fechaCelda;
        bloqueSolicitadoInput.value = bloqueCelda;

        // Determina si la celda está ocupada para mostrar u ocultar el botón "Eliminar"
        const solicitudEncontrada = data.find( // Asegúrate de que 'data' esté en el scope
            item => item.FechaSolicitud === fechaCelda && parseInt(item.Num_bloque) === parseInt(bloqueCelda)
        );

        if (solicitudEncontrada) {
            if (btnEliminar) {
                btnEliminar.style.display = 'block'; // Mostrar botón eliminar si hay solicitud
                // Aquí podrías almacenar el ID de la solicitud para eliminarla luego
                btnEliminar.dataset.solicitudId = solicitudEncontrada.idSolicitud; // Ejemplo de almacenar ID
            }
        } else {
            if (btnEliminar) {
                btnEliminar.style.display = 'none'; // Ocultar botón eliminar si no hay solicitud
                delete btnEliminar.dataset.solicitudId; // Limpiar el ID si no hay solicitud
            }
        }
        
        // Abre la ventana modal      
        modalSolicitud.style.display = 'block';
        
    });
});

// Cerrar la ventana modal al hacer clic en la "x"
cerrarModal.addEventListener('click', () => {
    modalSolicitud.style.display = 'none';
});

// Cerrar la ventana modal al hacer clic fuera del contenido modal
window.addEventListener('click', (event) => {
    if (event.target === modalSolicitud) {
        modalSolicitud.style.display = 'none';
    }
});

// Aquí puedes agregar la lógica para enviar el formulario
/*
async function enviarSolicitudInicial(formData) {
    try {
        const response = await fetch('procesar_solicitud.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        return await response.json();
    } catch (error) {
        console.error('Error al enviar la solicitud inicial:', error);
        return { error: 'Error de conexión con el servidor.' };
    }
}

async function verificarCodigo2FA(funcionarioId, codigo) {
    try {
        const response = await fetch('verificar_codigo_solicitud.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                funcionario_id: funcionarioId,
                codigo_2fa: codigo
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error al verificar el código 2FA:', error);
        return { error: 'Error de conexión con el servidor.' };
    }
}



formularioSolicitud.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fecha = fechaSolicitadaInput.value;
    const bloque = bloqueSolicitadoInput.value;
    const idFuncionario = idFuncionarioInput.value;
    const idRecurso = idRecursoInput.value;

    const dataString = fecha + bloque + idFuncionario + idRecurso;
    const dataHash = sha256(dataString);

    const formData = new FormData(formularioSolicitud);
    formData.append('data_hash', dataHash);

    const respuestaInicial = await enviarSolicitudInicial(formData);

    if (respuestaInicial.success_2fa) {
        // Mostrar la ventana emergente para el código 2FA
        modalConfirmacion2FA.style.display = 'block';
        mensaje2FA.textContent = 'Se ha enviado un código de verificación a su correo electrónico. Por favor, ingréselo para confirmar la solicitud.';

        btnVerificarCodigo.addEventListener('click', async () => {
            const codigoIngresado = codigo2FAInput.value;
            const respuestaVerificacion = await verificarCodigo2FA(idFuncionario, codigoIngresado);

            if (respuestaVerificacion.success) {
                mensaje2FA.textContent = 'Solicitud confirmada correctamente.';
                // Aquí puedes redirigir o realizar otras acciones después de la confirmación
                setTimeout(() => {
                    modalConfirmacion2FA.style.display = 'none';
                    modalSolicitud.style.display = 'none';
                    cargarHorario(); // Recargar el horario
                }, 1500);
            } else if (respuestaVerificacion.error) {
                mensaje2FA.textContent = respuestaVerificacion.error;
            }
        });

        // Opcional: Cerrar el modal de confirmación si se hace clic fuera
        window.addEventListener('click', (event) => {
            if (event.target === modalConfirmacion2FA) {
                modalConfirmacion2FA.style.display = 'none';
            }
        });

    } else if (respuestaInicial.error) {
        alert(respuestaInicial.error);
    }
});

*/

formularioSolicitud.addEventListener('submit', (event) => {
    event.preventDefault();

    const fecha = fechaSolicitadaInput.value;
    const bloque = bloqueSolicitadoInput.value;
    const idFuncionario = document.getElementById('idFuncionario').value;
    const idRecurso = document.getElementById('idRecurso').value; // Obtén el valor del select

    fetch('registrar_solicitud.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fecha_solicitud: fecha,
            num_bloque: bloque,
            idFuncionario: idFuncionario,
            idRecurso: idRecurso, // Agrega el ID del recurso al JSON
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Solicitud guardada:', data);
        modalSolicitud.style.display = 'none';
        cargarHorario();
    })
    .catch(error => {
        console.error('Error al guardar la solicitud:', error);
    });
});

// Lógica para el botón "Cancelar" (simplemente cerrar el modal)
btnCancelar.addEventListener('click', () => {
    modalSolicitud.style.display = 'none';
});

// Lógica para el botón "Eliminar" (si es visible)
if (btnEliminar) {
    btnEliminar.addEventListener('click', () => {
        const solicitudId = btnEliminar.dataset.solicitudId;
        if (solicitudId) {
            // Realizar la petición DELETE al servidor para eliminar la solicitud
            fetch(`eliminar_solicitud.php?id=${solicitudId}`, { // Reemplaza con la URL de tu script de eliminación
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                console.log('Solicitud eliminada:', data);
                modalSolicitud.style.display = 'none';
                cargarHorario(); // Recargar el horario
            })
            .catch(error => {
                console.error('Error al eliminar la solicitud:', error);
                // Mostrar mensaje de error
            });
        } else {
            console.warn('No se encontró el ID de la solicitud para eliminar.');
        }
    });
}

// Función de ejemplo para recargar el horario (debes implementarla)
function cargarHorario() {
        const daysInMonth = getDaysInMonth(currentMonth);
        const fecha_inicial_recarga = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`; // Asegúrate del formato MM
        const fecha_final_recarga = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`; // Asegúrate del formato MM y DD

        fetch(`buscar_mensual.php?fecha_ini=${fecha_inicial_recarga}&fecha_fin=${fecha_final_recarga}`)
        .then(response => response.json())
        .then(data => {
            // Asumiendo que 'fechaSolicitud' y 'numBloque' están definidos en el contexto donde se llama a este fetch
            const solicitud = data.find(
            item => item.FechaSolicitud === fechaSolicitud && parseInt(item.Num_bloque) === numBloque
            );

            if (solicitud) {
            cell.textContent = `Ocupado por ${solicitud.NombreFuncionario}`; // Usar NombreProfesor (corregido del backend)
            cell.style.backgroundColor = 'yellow';
            // Opcionalmente, podrías cambiar el color del texto también
            // cell.style.color = 'black';
            } else {
            cell.textContent = "Disponible";
            cell.style.backgroundColor = ''; // Reestablecer el color de fondo (o a tu color por defecto)
            // Opcionalmente, reestablecer el color del texto
            // cell.style.color = '';
            }
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
            cell.textContent = "Error";
            cell.style.backgroundColor = 'red'; // Indicar error con otro color
        });
        if (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) {
            cell.classList.add('weekend');
        }

}

// Llama a cargarHorario() al cargar la página para inicializar el horario
cargarHorario();