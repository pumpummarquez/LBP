// --- Referencias a los elementos del DOM ---

// Modales y formularios
const modalSolicitud = document.getElementById('modal-solicitud');
const formularioSolicitud = document.getElementById('formulario-solicitud');
const modalConfirmacion2FA = document.getElementById('modal-confirmacion-2fa'); // Modal 2FA (si aplica)
const modalDetalleRecursos = document.getElementById('modal-detalle-recursos'); // Nuevo modal de detalles

// Inputs y Selects del modal de solicitud
const fechaSolicitadaInput = document.getElementById('fecha_solicitada');
const bloqueSolicitadoInput = document.getElementById('bloque_solicitado');
const idFuncionarioInput = document.getElementById('idFuncionario'); // Input oculto con el ID del funcionario
// Asumiendo que añadiste un input hidden para el rol del funcionario en tu HTML:
const rolFuncionarioInput = document.getElementById('rolFuncionario'); // Input oculto con el rol del funcionario
const idRecursoSelect = document.getElementById('idRecurso'); // <-- Referencia correcta al SELECT de recursos

// Botones del modal de solicitud
const cerrarModalSolicitud = modalSolicitud.querySelector('.cerrar-modal'); // Botón cerrar 'x'
const btnCancelarSolicitud = document.getElementById('btn-cancelar'); // Botón Cancelar
const btnEliminar = document.getElementById('btn-eliminar'); // Botón Eliminar (visible solo al editar)

// Elementos del modal de confirmación 2FA
const codigo2FAInput = document.getElementById('codigo-2fa');
const btnVerificarCodigo = document.getElementById('btn-verificar-codigo');
const mensaje2FA = document.getElementById('mensaje-2fa');

// Elementos del nuevo modal de detalles
const detalleFechaSpan = document.getElementById('detalle-fecha');
const detalleBloqueSpan = document.getElementById('detalle-bloque');
const detalleGridContainer = document.getElementById('detalle-grid-container'); // Contenedor para la grilla de detalles
const btnSolicitarOtro = document.getElementById('btn-solicitar-otro'); // <-- Botón "Solicitar otro recurso"

// Elementos de la grilla principal y selector de mes
const monthSelector = document.getElementById('monthSelector');
const gridContainer = document.getElementById('gridContainer');
const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Variables de estado
let currentYear = new Date().getFullYear();
// Variable para almacenar TODAS las solicitudes cargadas para el mes actual
let allMonthRequests = [];
// Variable para almacenar el ID de la solicitud del usuario actual para la celda clickeada
let currentUserRequestId = null;
// Obtener el ID del usuario logueado desde el input hidden
const currentLoggedInUserId = idFuncionarioInput ? idFuncionarioInput.value : null;
// Obtener el rol del usuario logueado desde el input hidden
const currentLoggedInUserRole = rolFuncionarioInput ? rolFuncionarioInput.value : null;


// --- Funciones Auxiliares ---

// Función para obtener días en el mes
function getDaysInMonth(month, year = new Date().getFullYear()) {
    // Date months are 0-indexed, so month (1-indexed) needs -1
    return new Date(year, month, 0).getDate();
}

// Función para cargar recursos disponibles en el select del modal de solicitud
function cargarRecursosDisponibles() {
    // Limpiar opciones de recursos (excepto la primera 'Seleccione...')
    while (idRecursoSelect.options.length > 1) {
        idRecursoSelect.remove(1);
    }

    // Obtener recursos disponibles para llenar el selector
    // Puedes modificar este endpoint para que filtre recursos ya ocupados en la fecha/bloque actual
    // Si no lo haces, la validación de backend es crucial.
    fetch('obtener_recursos.php')
        .then(response => {
             if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
             }
            return response.json();
        })
        .then(recursos => {
            recursos.forEach(recurso => {
                const option = document.createElement('option');
                option.value = recurso.idRecurso;
                option.textContent = recurso.Descrip_Recurso;
                idRecursoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener los recursos:', error);
            const optionError = document.createElement('option');
            optionError.value = "";
            optionError.textContent = "Error al cargar los recursos";
            idRecursoSelect.appendChild(optionError);
             // Deshabilitar el botón de submit si falla la carga de recursos
             const submitBtn = formularioSolicitud.querySelector('button[type="submit"]');
             if(submitBtn) submitBtn.disabled = true;
        });
}


// --- Función para abrir el modal de solicitud y configurarlo ---
function NombreFuncionario(fecha, bloque) {
    // Llenar los campos de fecha y bloque en el modal
    fechaSolicitadaInput.value = fecha;
    bloqueSolicitadoInput.value = bloque;

    // Ocultar el botón eliminar por defecto y resetear el ID
    btnEliminar.style.display = 'none';
    currentUserRequestId = null; // Resetear el ID

    // Habilitar el botón de submit por defecto (se puede deshabilitar si falla la carga de recursos)
    const submitBtn = formularioSolicitud.querySelector('button[type="submit"]');
    if(submitBtn) submitBtn.disabled = false;


    // --- NUEVO: Verificar si el usuario actual tiene una solicitud en esta celda ---
    // Buscar en los datos cargados del mes
    const solicitudesEnCelda = allMonthRequests.filter(
        item => item.FechaSolicitud === fecha && parseInt(item.Num_bloque) === parseInt(bloque)
    );

    console.log(`Solicitudes encontradas en ${fecha} - Bloque ${bloque}:`, solicitudesEnCelda); // Log de depuración
    console.log(`Usuario Logueado ID: ${currentLoggedInUserId}`); // Log de depuración

    // *** CORRECCIÓN DE POSIBLE TIPOGRAFÍA: solicitudesEnCelCeldas -> solicitudesEnCelda ***
    // Usar find() para encontrar la solicitud específica del usuario logueado
    const userRequestInCell = solicitudesEnCelda.find(
        item => {
            // Log de depuración para comparar IDs
            console.log(`Comparando: ${item.Funcionario_idFuncionario} (type ${typeof item.Funcionario_idFuncionario}) == ${currentLoggedInUserId} (type ${typeof currentLoggedInUserId})`);
            // Usamos == para comparación flexible, o parseInt para asegurar tipos
             return parseInt(item.Funcionario_idFuncionario) === parseInt(currentLoggedInUserId);
            // return item.Funcionario_idFuncionario == currentLoggedInUserId; // Opción con == si prefieres
        }
    );

    console.log("Solicitud del usuario en esta celda:", userRequestInCell); // Log de depuración


    if (userRequestInCell) {
        // El usuario tiene una solicitud en esta celda
        currentUserRequestId = userRequestInCell.idSolicitud;
        btnEliminar.style.display = 'inline-block'; // O 'block', según tu layout CSS
        console.log(`Solicitud del usuario encontrada, ID: ${currentUserRequestId}. Botón Eliminar mostrado.`); // Log de depuración

        // Opcional: Mostrar un mensaje en el modal indicando que ya tiene una solicitud
        // Podrías añadir un span o div con un ID como 'mensaje-solicitud-existente' en el HTML del modal
        // const mensajeExistenteSpan = document.getElementById('mensaje-solicitud-existente');
        // if(mensajeExistenteSpan) mensajeExistenteSpan.textContent = `Ya solicitaste: ${userRequestInCell.Descrip_Recurso} (ID: ${userRequestInCell.idSolicitud})`;

    } else {
        // El usuario no tiene una solicitud en esta celda
        btnEliminar.style.display = 'none';
        currentUserRequestId = null;
        console.log("No se encontró solicitud del usuario en esta celda. Botón Eliminar oculto."); // Log de depuración
        // Opcional: Limpiar mensaje existente
        // const mensajeExistenteSpan = document.getElementById('mensaje-solicitud-existente');
        // if(mensajeExistenteSpan) mensajeExistenteSpan.textContent = '';
    }

    // Cargar los recursos disponibles en el select
    cargarRecursosDisponibles(); // Esta función ya limpia y llena el select

    // Mostrar el modal de solicitud
    modalSolicitud.style.display = 'block';
}



// --- Función principal para generar la grilla ---
// month es el número del mes (1-12)
function generateGrid(month) {
    gridContainer.innerHTML = ''; // Limpiar la grilla anterior

    const daysInMonth = getDaysInMonth(month, currentYear);

    // Crear las cabeceras de los días de la semana
    const headers = ['Día', 'Día Semana', 'Bloque 1', 'Bloque 2', 'Bloque 3', 'Bloque 4', 'Bloque 5', 'Bloque 6', 'Bloque 7'];
    for (let j = 0; j < headers.length; j++) {
        const headerCell = document.createElement('div');
        headerCell.classList.add('grid-item', 'day-column');
        headerCell.textContent = headers[j];
        headerCell.style.cursor = 'default';
        gridContainer.appendChild(headerCell);
    }

    // Calcular fechas de inicio y fin del mes para el fetch
    const fecha_inicial = `${currentYear}-${String(month).padStart(2, '0')}-01`;
    const fecha_final = `${currentYear}-${String(month).padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

    // *** Realizar la llamada AJAX principal para obtener todos los datos del mes ***
    // Asegúrate de que buscar_mensual.php devuelva idSolicitud y Funcionario_idFuncionario
    fetch(`buscar_mensual.php?fecha_ini=${fecha_inicial}&fecha_fin=${fecha_final}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // data es el array de solicitudes del mes completo
            allMonthRequests = data; // <-- Almacenar los datos en la variable global/accesible
            console.log('Datos recibidos de buscar_mensual.php y almacenados:', allMonthRequests); // Para depuración

            // Generar las celdas de la grilla día por día
            for (let i = 1; i <= daysInMonth; i++) { // Iterar por días del mes (filas)
                const currentDate = new Date(currentYear, month - 1, i);
                const dayOfWeekIndex = currentDate.getDay();
                const dayOfWeekName = daysOfWeek[dayOfWeekIndex];
                const fechaSolicitud = currentDate.toISOString().slice(0, 10); // Formato AAAA-MM-DD

                for (let j = 0; j < 9; j++) { // Iterar por columnas (Día, Día Semana, Bloques)
                    const cell = document.createElement('div');
                    cell.classList.add('grid-item');

                    // Las dos primeras columnas son el día del mes y el nombre del día
                    if (j === 0) {
                        cell.classList.add('day-column');
                        cell.textContent = i;
                        cell.style.cursor = 'default'; // No clicable
                    } else if (j === 1) {
                        cell.textContent = dayOfWeekName;
                        cell.style.cursor = 'default'; // No clicable
                    } else {
                        // Columnas de bloques (j >= 2)
                        const numBloque = j - 2; // Bloques 0-6 (columnas 2-8)
                        // Almacenar información relevante en el dataset de la celda
                        cell.dataset.day = i;
                        cell.dataset.fecha = fechaSolicitud;
                        cell.dataset.bloque = numBloque;
                        cell.style.cursor = 'pointer';

                        // Buscar solicitudes para esta celda específica en los datos cargados
                        const solicitudesEnCelda = allMonthRequests.filter(
                            item => item.FechaSolicitud === fechaSolicitud && parseInt(item.Num_bloque) === numBloque
                        );

                        if (solicitudesEnCelda.length > 0) {
                            // Si hay solicitudes, esta celda está ocupada
                            cell.textContent = "Ver recursos ocupados";
                            cell.style.backgroundColor = 'yellow';
                             // *** Almacenar los datos de las solicitudes en el dataset de la celda ***
                             // Esto es crucial para el modal de detalle
                             cell.dataset.occupations = JSON.stringify(solicitudesEnCelda);

                            // --- Agregar Event Listener para ABRIR EL MODAL DE DETALLE ---
                            cell.addEventListener('click', function() {
                                const fecha_celda = this.dataset.fecha;
                                const bloque_celda = this.dataset.bloque;
                                console.log(`Celda Ocupada clicada: Fecha ${fecha_celda}, Bloque ${bloque_celda}`);

                                // La celda está ocupada, abrir el modal de detalle
                                try {
                                    const ocupaciones = JSON.parse(this.dataset.occupations);

                                    // Llenar los datos básicos en el modal de detalle
                                    detalleFechaSpan.textContent = fecha_celda;
                                    detalleBloqueSpan.textContent = bloque_celda;

                                    // Limpiar contenido previo del detalle
                                    detalleGridContainer.innerHTML = '';

                                    // Agrupar ocupaciones por tipo de recurso (si necesitas la vista agrupada)
                                    // Si solo necesitas listar todas las solicitudes, puedes omitir la agrupación
                                    const ocupacionesPorRecurso = ocupaciones.reduce((acc, current) => {
                                         const descRecurso = current.Descrip_Recurso;
                                         if (!acc[descRecurso]) {
                                             acc[descRecurso] = [];
                                         }
                                         acc[descRecurso].push(current);
                                         return acc;
                                    }, {});

                                    // Generar el HTML para cada grupo de recurso en el modal de detalle
                                     for (const recurso in ocupacionesPorRecurso) {
                                         const recursosOcupados = ocupacionesPorRecurso[recurso];

                                         const tituloRecurso = document.createElement('h5');
                                         tituloRecurso.classList.add('detalle-recurso-titulo');
                                         tituloRecurso.textContent = `Recurso: ${recurso}`;
                                         detalleGridContainer.appendChild(tituloRecurso);

                                         const detalleList = document.createElement('ul');
                                         detalleList.classList.add('list-group', 'mb-3');

                                         recursosOcupados.forEach(solicitud => {
                                             const listItem = document.createElement('li');
                                             listItem.classList.add('list-group-item');
                                             // Mostrar nombre completo del funcionario
                                             listItem.innerHTML = `
                                                 <strong>Funcionario:</strong> ${solicitud.NombreFuncionario} ${solicitud.ApellidoFuncionario}
                                                 ${solicitud.Funcionario_idFuncionario == currentLoggedInUserId ? ' (Tú)' : ''}
                                                 `;
                                             detalleList.appendChild(listItem);
                                         });
                                         detalleGridContainer.appendChild(detalleList);
                                    }


                                    // Mostrar el nuevo modal de detalle
                                    modalDetalleRecursos.style.display = 'block';

                                } catch (e) {
                                    console.error('Error al parsear datos de ocupación o generar HTML del detalle:', e);
                                    alert('Error al mostrar detalles de ocupación.');
                                }
                            });

                        } else {
                            // Si no hay solicitudes, la celda está disponible
                            cell.textContent = "Disponible";
                            cell.style.backgroundColor = ''; // Reestablecer color
                            delete cell.dataset.occupations; // Asegurarse de que no haya datos de ocupación viejos

                            // --- Agregar Event Listener para ABRIR EL MODAL DE SOLICITUD (Crear) ---
                            cell.addEventListener('click', function() {
                                const fecha_celda = this.dataset.fecha;
                                const bloque_celda = this.dataset.bloque;
                                console.log(`Celda Disponible clicada: Fecha ${fecha_celda}, Bloque ${bloque_celda}`);

                                // Abrir el modal de solicitud usando la función centralizada
                                NombreFuncionario(fecha_celda, bloque_celda);
                            });
                        }

                        // Marcar fines de semana (aplicable a todas las celdas de la fila)
                        if (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) {
                            cell.classList.add('weekend');
                        }
                    }
                    gridContainer.appendChild(cell);
                }
            }
        })
        .catch(error => {
            console.error('Error al obtener datos mensuales:', error);
            gridContainer.innerHTML = '<div class="col-12 text-danger">Error al cargar los datos del calendario. Intente recargar la página.</div>';
        });
}

// --- Event Listener para el selector de mes ---
monthSelector.addEventListener('change', function() {
    const selectedMonth = parseInt(this.value); // Mes seleccionado (1-indexed)
    generateGrid(selectedMonth); // Regenerar la grilla para el nuevo mes
});

// Event Listeners para cerrar el modal de solicitud (modal original)
if (cerrarModalSolicitud) {
    cerrarModalSolicitud.addEventListener('click', () => {
        modalSolicitud.style.display = 'none';
    });
}

if (btnCancelarSolicitud) {
    btnCancelarSolicitud.addEventListener('click', () => {
        modalSolicitud.style.display = 'none';
    });
}

// --- Lógica para el nuevo botón "Solicitar otro recurso" (dentro del modal de detalle) ---
if (btnSolicitarOtro) {
    btnSolicitarOtro.addEventListener('click', function() {
        // Obtener la fecha y el bloque mostrados en el modal de detalle
        const fechaSolicitada = detalleFechaSpan.textContent;
        const bloqueSolicitado = detalleBloqueSpan.textContent;

        // Cerrar el modal de detalle
        modalDetalleRecursos.style.display = 'none';

        // Abrir el modal de solicitud y configurarlo
        NombreFuncionario(fechaSolicitada, bloqueSolicitado);
    });
}


// --- Event Listener para el formulario de solicitud (modal original) ---
// Este listener es para CREAR una nueva solicitud
if (formularioSolicitud) {
    formularioSolicitud.addEventListener('submit', (event) => {
        event.preventDefault();

        const fecha = fechaSolicitadaInput.value;
        const bloque = bloqueSolicitadoInput.value;
        const idFuncionario = idFuncionarioInput.value; // Usar la referencia correcta
        const idRecurso = idRecursoSelect.value; // Obtén el valor del select (referencia correcta)

         if (!idRecurso || idRecurso === "") {
             alert("Por favor, seleccione un recurso.");
             return; // Detener el envío si no se seleccionó recurso
         }

        // Aquí podrías añadir lógica para verificar 2FA si el backend lo requiere
        // Si 2FA es necesario, quizás no haces el fetch aquí, sino que abres el modal 2FA.

        fetch('registrar_solicitud.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                fecha_solicitud: fecha,
                num_bloque: bloque,
                idFuncionario: idFuncionario,
                idRecurso: idRecurso,
            }),
        })
        .then(response => {
             if (!response.ok) {
                  // Intenta leer el cuerpo del error si no es JSON o si es un error HTTP no 2xx
                 return response.json().then(err => {
                      // Preferir el mensaje del backend si está en el JSON de error
                     throw new Error(err.message || 'Error en el registro.');
                 }).catch(() => {
                     // Si no es JSON o falla, leer como texto
                     return response.text().then(text => {
                         console.error('HTTP error body (non-JSON):', text);
                         throw new Error(`HTTP error! status: ${response.status}, body: ${text.substring(0, 200)}...`);
                     });
                 });
             }
             return response.json(); // Asume que la respuesta JSON es exitosa o contiene un mensaje de negocio
         })
        .then(data => {
            console.log('Respuesta del servidor (registrar):', data);
            if (data.success) {
                alert(data.message || 'Solicitud registrada con éxito.');
                modalSolicitud.style.display = 'none';
                 // Recargar la grilla actual después de un registro exitoso
                 const currentSelectedMonth = parseInt(monthSelector.value);
                 generateGrid(currentSelectedMonth);
            } else {
                 // Manejar errores de negocio o validación desde el backend
                 alert('Error al registrar solicitud: ' + (data.message || 'Error desconocido.'));
            }
        })
        .catch(error => {
            console.error('Error al guardar la solicitud:', error);
            alert('Ocurrió un error al comunicarse con el servidor al registrar la solicitud: ' + error.message);
        });
    });
}


// --- Lógica para el botón "Eliminar" (modal original) ---
// Este listener está activo si el botón existe
if (btnEliminar) {
    btnEliminar.addEventListener('click', () => {
         // Usamos la variable currentUserRequestId que se llenó al abrir el modal
        const solicitudId = currentUserRequestId;

         if (!solicitudId) {
             console.warn('No se encontró el ID de la solicitud para eliminar.');
             alert('No se puede eliminar. Falta el ID de la solicitud.');
             return;
         }

        if (confirm('¿Está seguro de que desea eliminar esta solicitud? Esta acción no se puede deshacer.')) {
            // Realizar la petición al servidor para eliminar la solicitud
            // Usando POST y enviando el ID en el cuerpo JSON, como en el registro
            fetch('delete_solicitud.php', { // <-- Tu nuevo endpoint de eliminación
                method: 'POST', // Usar POST es común, aunque DELETE sería más RESTful
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // Indicativo para el backend
                },
                body: JSON.stringify({ idSolicitud: solicitudId }) // Enviar el ID en el cuerpo
            })
            .then(response => {
                if (!response.ok) {
                    // Similar manejo de errores que en el registro
                    return response.json().then(err => {
                         throw new Error(err.message || 'Error en la eliminación.');
                    }).catch(() => {
                        return response.text().then(text => {
                            console.error('HTTP error body (non-JSON):', text);
                            throw new Error(`HTTP error! status: ${response.status}, body: ${text.substring(0, 200)}...`);
                        });
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Respuesta del servidor (eliminar):', data);
                if (data.success) {
                    alert(data.message || 'Solicitud eliminada con éxito.');
                    modalSolicitud.style.display = 'none';
                    // Recargar la grilla actual después de eliminar
                    const currentSelectedMonth = parseInt(monthSelector.value);
                    generateGrid(currentSelectedMonth);
                } else {
                    alert('Error al eliminar solicitud: ' + (data.message || 'Error desconocido.'));
                }
            })
            .catch(error => {
                console.error('Error al eliminar la solicitud:', error);
                alert('Ocurrió un error al comunicarse con el servidor al eliminar la solicitud: ' + error.message);
            });
        }
        // Si el usuario cancela la confirmación, no hacemos nada
    });
}

// --- Lógica para cerrar *cualquier* modal haciendo clic fuera ---
window.onclick = function(event) {
    if (event.target == modalDetalleRecursos) {
        modalDetalleRecursos.style.display = "none";
    }
    if (event.target == modalSolicitud) {
        modalSolicitud.style.display = "none";
    }
    // Si implementas el modal de 2FA con display='block/none', añadirlo aquí también
    if (modalConfirmacion2FA && event.target == modalConfirmacion2FA) {
         modalConfirmacion2FA.style.display = "none";
       }
}

// --- Inicializar la grilla al cargar la página ---
// Establecer el mes inicial en el selector
monthSelector.value = new Date().getMonth() + 1; // Establecer al mes actual (1-indexed)

// Usar la función generateGrid con el mes inicialmente seleccionado en el selector
const initialMonthSelected = parseInt(monthSelector.value);
generateGrid(initialMonthSelected);