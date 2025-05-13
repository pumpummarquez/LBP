const calendarioBody = document.getElementById('calendario-body');
const selectorMes = document.getElementById('mes');
const modalSolicitud = document.getElementById('modal-solicitud');
const cerrarModal = document.querySelector('.cerrar-modal');
const formularioSolicitud = document.getElementById('formulario-solicitud');
const inputNombreProfesor = document.getElementById('NombreFuncionario');
const inputFechaSolicitada = document.getElementById('fecha_solicitada');
const inputBloqueSolicitado = document.getElementById('bloque_solicitado');
const btnEliminar = document.getElementById('btn-eliminar');
const btnCancelar = document.getElementById('btn-cancelar');

let solicitudes = []; // Aquí almacenaremos las solicitudes obtenidas del backend
let mesActual = new Date().getMonth(); // 0 = Enero, 11 = Diciembre
let añoActual = new Date().getFullYear();
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const bloquesHorarios = [1, 2, 3, 4, 5, 6, 7, 8]; // Definir tus bloques horarios

document.addEventListener('DOMContentLoaded', function() {
    const recursoSelect = document.getElementById('idRecurso');

    fetch('obtener_recursos.php') // Reemplaza con la ruta correcta a tu archivo PHP
        .then(response => response.json())
        .then(data => {
            data.forEach(recurso => {
                const option = document.createElement('option');
                option.value = recurso.idRecurso;
                option.textContent = recurso.Descrip_Recurso;
                recursoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener los recursos:', error);
            // Puedes mostrar un mensaje de error al usuario aquí
        });
});
// Suponiendo que el nombre del profesor ya está disponible desde el login
const profesorLogueado = "Nombre del Profesor Ejemplo"; // Reemplazar con el valor real

// Función para obtener las solicitudes del backend
async function obtenerSolicitudes(mes, año) {
    try {
        const response = await fetch(`obtener_solicitudes.php?mes=${mes + 1}&año=${año}`); // Ajusta la URL si es necesario
        solicitudes = await response.json();
        renderizarCalendario(mes, año);
    } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
    }
}

// Función para enviar la solicitud al backend
async function enviarSolicitud(formData) {
    try {
        const response = await fetch('procesar_solicitud.php', {
            method: 'POST',
            body: formData
        });
        const resultado = await response.json();
        if (resultado.success) {
            alert(resultado.success);
            modalSolicitud.style.display = 'none';
            obtenerSolicitudes(mesActual, añoActual); // Recargar el calendario
        } else if (resultado.error) {
            alert(resultado.error);
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
    }
}

// Función para eliminar una solicitud (necesitarás un endpoint en el backend)
async function eliminarSolicitud(fecha, bloque) {
    // Implementar lógica para identificar la solicitud a eliminar
    // y hacer una petición DELETE al backend
    console.log(`Eliminar solicitud para ${fecha}, bloque ${bloque}`);
    // Después de eliminar, recargar el calendario
    // obtenerSolicitudes(mesActual, añoActual);
}

// Inicializar el selector de meses
meses.forEach((nombreMes, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = nombreMes;
    option.selected = index === mesActual;
    selectorMes.appendChild(option);
});

selectorMes.addEventListener('change', (event) => {
    mesActual = parseInt(event.target.value);
    renderizarCalendario(mesActual, añoActual);
});

// Cerrar la modal
cerrarModal.addEventListener('click', () => {
    modalSolicitud.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modalSolicitud) {
        modalSolicitud.style.display = 'none';
    }
});

formularioSolicitud.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formularioSolicitud);
    enviarSolicitud(formData);
});

btnCancelar.addEventListener('click', () => {
    modalSolicitud.style.display = 'none';
});

btnEliminar.addEventListener('click', () => {
    // Aquí deberías tener la lógica para identificar la solicitud específica a eliminar
    // Basándote en la fecha y el bloque mostrados en la modal
    eliminarSolicitud(inputFechaSolicitada.value, inputBloqueSolicitado.value);
    modalSolicitud.style.display = 'none';
});

// Cargar las solicitudes iniciales
obtenerSolicitudes(mesActual, añoActual);
```

**3. Controlador (JavaScript - Lógica de la Interfaz de Usuario):**

```
// script.js (continuación)

function obtenerDiasEnMes(mes, año) {
    return new Date(año, mes + 1, 0).getDate();
}

function obtenerPrimerDiaSemana(mes, año) {
    return new Date(año, mes, 1).getDay(); // 0 = Domingo, 1 = Lunes, ...
}

function formatearFecha(dia, mes, año) {
    const mesFormateado = (mes + 1).toString().padStart(2, '0');
    const diaFormateado = dia.toString().padStart(2, '0');
    return `${año}-${mesFormateado}-${diaFormateado}`;
}

function renderizarCalendario(mes, año) {
    calendarioBody.innerHTML = ''; // Limpiar el calendario anterior
    const diasDelMes = obtenerDiasEnMes(mes, año);
    const primerDia = obtenerPrimerDiaSemana(mes, año);

    let diaActual = 1;

    for (let i = 0; i < 6; i++) { // Hasta 6 filas para cubrir todos los meses
        const fila = document.createElement('tr');

        // Celda para la fecha (solo de lunes a viernes)
        if (i > 0 || primerDia <= 5) { // Empezar a mostrar fechas a partir del lunes de la primera semana
            for (let j = 0; j < 7; j++) { // 7 días de la semana
                if ((i === 0 && j < primerDia) || diaActual > diasDelMes || j > 4) {
                    const celdaFecha = document.createElement('td');
                    fila.appendChild(celdaFecha);
                } else if (j >= primerDia && j <= 4 && diaActual <= diasDelMes) {
                    const celdaFecha = document.createElement('td');
                    celdaFecha.textContent = formatearFecha(diaActual, mes, año).slice(-5); // Mostrar solo DD-MM
                    fila.appendChild(celdaFecha);
                    diaActual++;
                } else if (i > 0 && j >= 0 && j <= 4 && diaActual <= diasDelMes) {
                    const celdaFecha = document.createElement('td');
                    celdaFecha.textContent = formatearFecha(diaActual, mes, año).slice(-5); // Mostrar solo DD-MM
                    fila.appendChild(celdaFecha);
                    diaActual++;
                }
            }
        } else {
            // Si la primera semana no tiene días de lunes a viernes, agregar celdas vacías para la fecha
            for (let j = 0; j < 1; j++) {
                const celdaFecha = document.createElement('td');
                fila.appendChild(celdaFecha);
            }
        }

        // Celdas para los bloques horarios
        for (let k = 0; k < bloquesHorarios.length; k++) {
            const celdaBloque = document.createElement('td');
            if (fila.children[0] && fila.children[0].textContent) {
                const fechaCelda = `${año}-${(mes + 1).toString().padStart(2, '0')}-${fila.children[0].textContent.split('-')[0]}`;
                const bloqueActual = bloquesHorarios[k];
                const ocupado = solicitudes.some(solicitud =>
                    solicitud.fecha_solicitada === fechaCelda &&
                    parseInt(solicitud.numero_bloque) === bloqueActual
                );

                celdaBloque.classList.add('bloque');
                celdaBloque.dataset.fecha = fechaCelda;
                celdaBloque.dataset.bloque = bloqueActual;

                if (ocupado) {
                    celdaBloque.classList.add('ocupado');
                    celdaBloque.title = solicitudes.find(solicitud =>
                        solicitud.fecha_solicitada === fechaCelda &&
                        parseInt(solicitud.numero_bloque) === bloqueActual
                    ).NombreFuncionario || 'Ocupado';
                } else if (fila.children[0].textContent) {
                    celdaBloque.classList.add('disponible');
                    celdaBloque.addEventListener('click', mostrarModalSolicitud);
                }
            }
            fila.appendChild(celdaBloque);
        }

        if (fila.children.length > 1) { // Asegurarse de que la fila tenga celdas de bloques
            calendarioBody.appendChild(fila);
        }
    }
}

function mostrarModalSolicitud(event) {
    const celda = event.target;
    if (celda.classList.contains('disponible')) {
        const fechaSeleccionada = celda.dataset.fecha;
        const bloqueSeleccionado = celda.dataset.bloque;

        inputNombreProfesor.value = profesorLogueado;
        inputFechaSolicitada.value = fechaSeleccionada;
        inputBloqueSolicitado.value = bloqueSeleccionado;

        // Aquí podrías cargar información adicional si es necesario

        modalSolicitud.style.display = 'block';
    }
}
