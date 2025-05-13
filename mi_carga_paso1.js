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

// este es nuevo codigo para nuevo modal
const monthSelector = document.getElementById('monthSelector');
const gridContainer = document.getElementById('gridContainer');
const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Obtener el mes actual (0-11)
let currentYear = new Date().getFullYear(); // Definir como variable global
const currentMonth = new Date().getMonth();
// Establecer la opción seleccionada en el selector al mes actual
monthSelector.value = currentMonth + 1;

// Referencias al nuevo modal de detalles
const modalDetalleRecursos = document.getElementById('modal-detalle-recursos');
const detalleFechaSpan = document.getElementById('detalle-fecha');
const detalleBloqueSpan = document.getElementById('detalle-bloque');
const detalleGridContainer = document.getElementById('detalle-grid-container');
const btnSolicitarOtro = document.getElementById('btn-solicitar-otro'); // <-- Nueva referencia al botón
const cerrarModalSolicitud = modalSolicitud.querySelector('.cerrar-modal');
const btnCancelarSolicitud = document.getElementById('btn-cancelar');

monthSelector.addEventListener('change', function() {
    const selectedMonth = parseInt(this.value);
    generateGrid(selectedMonth);
});

function getDaysInMonth(month, year = new Date().getFullYear()) {
    // Date months are 0-indexed, so month is 1-indexed here, subtract 1 for Date constructor
    return new Date(year, month, 0).getDate();
}


function generateGrid(month) {
    gridContainer.innerHTML = ''; // Limpiar la grilla anterior

    const daysInMonth = getDaysInMonth(month);
    let currentYear = new Date().getFullYear(); // Define currentYear within the function scope or ensure it's accessible

    // Primero, crea las cabeceras de los días de la semana
    for (let j = 0; j < 9; j++) {
        const headerCell = document.createElement('div');
        headerCell.classList.add('grid-item', 'day-column'); // Usar day-column para estilo de cabecera
        if (j === 0) {
            headerCell.textContent = 'Día';
        } else if (j === 1) {
            headerCell.textContent = 'Día Semana';
        } else {
            headerCell.textContent = `Bloque ${j - 1}`; // Bloques 1-7 (columnas 3-9)
        }
        // Opcional: Añadir estilo diferente a las cabeceras si se desea
        // headerCell.style.fontWeight = 'bold';
        gridContainer.appendChild(headerCell);
    }
    const fecha_inicial = `${currentYear}-${String(month).padStart(2, '0')}-01`;
    const fecha_final = `${currentYear}-${String(month).padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;



    
    // *** Realizar la llamada AJAX principal para obtener todos los datos del mes ***
    fetch(`buscar_mensual.php?fecha_ini=${fecha_inicial}&fecha_fin=${fecha_final}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // data es el array de solicitudes del mes completo
            console.log('Datos recibidos de buscar_mensual.php:', data); // Para depuración

            for (let i = 1; i <= daysInMonth; i++) {
                const currentDate = new Date(currentYear, month - 1, i);
                const dayOfWeekIndex = currentDate.getDay();
                const dayOfWeekName = daysOfWeek[dayOfWeekIndex];
                const fechaSolicitud = currentDate.toISOString().slice(0, 10); // Formato AAAA-MM-DD

                for (let j = 0; j < 9; j++) { // 9 columnas (Día, Día Semana, Bloque 1 a 7)
                    const cell = document.createElement('div');
                    cell.classList.add('grid-item');

                    // Las dos primeras columnas son el día del mes y el nombre del día
                    if (j === 0) {
                        cell.classList.add('day-column');
                        cell.textContent = i;
                    } else if (j === 1) {
                        cell.textContent = dayOfWeekName;
                    } else {
                        // Columnas de bloques (j >= 2)
                        const numBloque = j - 2; // Bloques 0-6 (columnas 2-8)
                        cell.dataset.row = i; // Guardar la fila (día)
                        cell.dataset.col = j + 1; // Guardar la columna (1-indexed, útil para referencia)
                        cell.dataset.fecha = fechaSolicitud; // Guardar la fecha AAAA-MM-DD
                        cell.dataset.bloque = numBloque; // Guardar el número de bloque (0-6)

                        // Buscar solicitudes para esta celda específica (fecha y bloque)
                        const solicitudesEnCelda = data.filter(
                            item => item.FechaSolicitud === fechaSolicitud && parseInt(item.Num_bloque) === numBloque
                        );

                        if (solicitudesEnCelda.length > 0) {
                            // Si hay solicitudes, esta celda está ocupada
                            cell.textContent = "Ver recursos ocupados";
                            cell.style.backgroundColor = 'yellow';
                            // *** Almacenar los datos de las solicitudes en el dataset de la celda ***
                            cell.dataset.occupations = JSON.stringify(solicitudesEnCelda);
                            //cell.classList.add('occupied-cell'); // Añadir clase para fácil identificación/estilo
                        } else {
                            // Si no hay solicitudes, la celda está disponible
                            cell.textContent = "Disponible";
                            cell.style.backgroundColor = ''; // Reestablecer color
                        }

                        // Agregar el evento click SOLO a las celdas de bloques (j >= 2)
                        cell.addEventListener('click', function() {
                            const fecha_celda = this.dataset.fecha;
                            const bloque_celda = this.dataset.bloque;

                            // Verificar si la celda tiene datos de ocupación almacenados
                            if (this.dataset.occupations) {
                                // La celda está ocupada, abrir el modal de detalle
                                const ocupaciones = JSON.parse(this.dataset.occupations);

                                // Llenar los datos básicos en el modal de detalle
                                detalleFechaSpan.textContent = fecha_celda;
                                detalleBloqueSpan.textContent = bloque_celda;

                                // Limpiar contenido previo del detalle
                                detalleGridContainer.innerHTML = '';

                                // Agrupar ocupaciones por tipo de recurso
                                const ocupacionesPorRecurso = ocupaciones.reduce((acc, current) => {
                                    const descRecurso = current.Descrip_Recurso;
                                    if (!acc[descRecurso]) {
                                        acc[descRecurso] = [];
                                    }
                                    acc[descRecurso].push(current);
                                    return acc;
                                }, {});

                                // Generar el HTML para cada grupo de recurso
                                for (const recurso in ocupacionesPorRecurso) {
                                    const recursosOcupados = ocupacionesPorRecurso[recurso];

                                    const tituloRecurso = document.createElement('h5');
                                    tituloRecurso.classList.add('detalle-recurso-titulo');
                                    tituloRecurso.textContent = `Recurso: ${recurso}`;
                                    detalleGridContainer.appendChild(tituloRecurso);

                                    const detalleGrid = document.createElement('div');
                                    detalleGrid.classList.add('detalle-grid');

                                    recursosOcupados.forEach(solicitud => {
                                        const item = document.createElement('div');
                                        item.classList.add('detalle-item');
                                        item.innerHTML = `
                                            <p><strong>Fecha:</strong> ${solicitud.FechaSolicitud}</p>
                                            <p><strong>Bloque:</strong> ${solicitud.Num_bloque}</p>
                                            <p><strong>Funcionario:</strong> ${solicitud.NombreFuncionario} ${solicitud.ApellidoFuncionario}</p>
                                            <p><strong>Recurso:</strong> ${solicitud.Descrip_Recurso}</p>
                                            `;
                                        detalleGrid.appendChild(item);
                                    });
                                    detalleGridContainer.appendChild(detalleGrid);
                                }

                                // Mostrar el nuevo modal de detalle
                                modalDetalleRecursos.style.display = 'block';

                            } else {
                                // La celda está disponible, abrir el modal de solicitud (comportamiento existente)
                                console.log(`Celda disponible: Fila ${this.dataset.row}, Columna ${this.dataset.col}`);

                                // Llenar los campos del modal de solicitud
                                const fechaSolicitadaInput = document.getElementById('fecha_solicitada');
                                const bloqueSolicitadoInput = document.getElementById('bloque_solicitado');

                                fechaSolicitadaInput.value = fecha_celda;
                                bloqueSolicitadoInput.value = bloque_celda;

                                // Limpiar opciones de recursos (excepto la primera 'Seleccione...')
                                const selectRecurso = document.getElementById('idRecurso');
                                while (selectRecurso.options.length > 1) {
                                    selectRecurso.remove(1);
                                }

                                // Obtener recursos disponibles para llenar el selector
                                fetch('obtener_recursos.php')
                                    .then(recursos => recursos.json())
                                    .then(recursos => {
                                        recursos.forEach(recurso => { // Cambio de 'recursos' a 'recurso' en el forEach
                                            const option = document.createElement('option');
                                            option.value = recurso.idRecurso;
                                            option.textContent = recurso.Descrip_Recurso;
                                            selectRecurso.appendChild(option);
                                        });
                                    })
                                    .catch(error => {
                                        console.error('Error al obtener los recursos:', error);
                                        const optionError = document.createElement('option');
                                        optionError.value = "";
                                        optionError.textContent = "Error al cargar los recursos";
                                        selectRecurso.appendChild(optionError);
                                    });

                                // Mostrar/Ocultar botón Eliminar (la lógica actual parece simple, podrías refinarla)
                                const btnEliminar = document.getElementById('btn-eliminar');
                                 // Aquí deberías verificar si hay una *solicitud específica* que este usuario pueda eliminar.
                                 // La lógica actual `solicitudEncontrada = true` siempre lo muestra.
                                 // Deberías, quizás, hacer otra consulta o verificar los datos almacenados si tuvieras ID de solicitud y ID de usuario.
                                 // Por ahora, lo ocultamos por defecto en el modal de solicitud, ya que este modal es para *crear* una solicitud, no eliminar una existente.
                                 if (btnEliminar) {
                                     btnEliminar.style.display = 'none';
                                 }


                                // Mostrar el modal de solicitud
                                modalSolicitud.style.display = 'block';
                            }
                        });
                    }

                    // Marcar fines de semana
                    if (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) {
                        cell.classList.add('weekend');
                    }

                    gridContainer.appendChild(cell);
                }
            }
        })
        .catch(error => {
            console.error('Error al obtener datos mensuales:', error);
            // Opcional: mostrar un mensaje de error en la interfaz
            gridContainer.innerHTML = '<div class="col-12 text-danger">Error al cargar los datos del calendario.</div>';
        });
}

// Obtener el mes actual y generar la grilla inicial
const initialMonth = new Date().getMonth() + 1;
generateGrid(initialMonth);

// Lógica para cerrar el nuevo modal al hacer clic fuera de él
window.onclick = function(event) {
    if (event.target == modalDetalleRecursos) {
        modalDetalleRecursos.style.display = "none";
    }
    if (event.target == modalSolicitud) { // También para el modal existente
        modalSolicitud.style.display = "none";
    }
    // Asegúrate de añadir lógica similar si implementas el modal de 2FA de esta manera
}



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