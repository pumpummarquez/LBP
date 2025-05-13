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

    // Variables de estado para la fecha actual (año y mes)
    let currentYear = new Date().getFullYear();
    // const currentMonthIndex = new Date().getMonth(); // Ya no es estrictamente necesaria si usamos monthSelector.value


    // --- Lógica de Event Listeners ---

    // Event Listener para el selector de mes
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
    if (btnSolicitarOtro) { // Verificar que el botón exista
        btnSolicitarOtro.addEventListener('click', function() {
            // Obtener la fecha y el bloque mostrados en el modal de detalle
            const fechaSolicitada = detalleFechaSpan.textContent;
            const bloqueSolicitado = detalleBloqueSpan.textContent;

            // Cerrar el modal de detalle
            modalDetalleRecursos.style.display = 'none';

            // Ahora, abrir el modal de solicitud y precargarlo
            // Llenar los campos del modal de solicitud
            fechaSolicitadaInput.value = fechaSolicitada;
            bloqueSolicitadoInput.value = bloqueSolicitado;

            // Limpiar opciones de recursos (excepto la primera 'Seleccione...')
            while (idRecursoSelect.options.length > 1) { // Usar la referencia correcta idRecursoSelect
                idRecursoSelect.remove(1);
            }

            // Obtener recursos disponibles para llenar el selector
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
                        idRecursoSelect.appendChild(option); // Usar la referencia correcta idRecursoSelect
                    });
                     // Opcional: asegurarse de que el botón de submit esté habilitado si la carga fue exitosa
                     // const submitBtn = formularioSolicitud.querySelector('button[type="submit"]');
                     // if(submitBtn) submitBtn.disabled = false;
                })
                .catch(error => {
                    console.error('Error al obtener los recursos:', error);
                    const optionError = document.createElement('option');
                    optionError.value = "";
                    optionError.textContent = "Error al cargar los recursos";
                    idRecursoSelect.appendChild(optionError); // Usar la referencia correcta idRecursoSelect
                     // Deshabilitar el botón de submit si falla la carga de recursos
                     // const submitBtn = formularioSolicitud.querySelector('button[type="submit"]');
                     // if(submitBtn) submitBtn.disabled = true;
                });

             // Ocultar el botón de eliminar en el modal de solicitud (este flujo es para crear una nueva solicitud)
             const btnEliminar = document.getElementById('btn-eliminar');
             if (btnEliminar) {
                 btnEliminar.style.display = 'none';
                 delete btnEliminar.dataset.solicitudId; // Limpiar cualquier ID previo
             }

            // Mostrar el modal de solicitud
            modalSolicitud.style.display = 'block';
        });
    }


    // --- Event Listener para el formulario de solicitud (modal original) ---
    if (formularioSolicitud) { // Verificar que el formulario exista
        formularioSolicitud.addEventListener('submit', (event) => {
            event.preventDefault();

            const fecha = fechaSolicitadaInput.value;
            const bloque = bloqueSolicitadoInput.value;
            const idFuncionario = idFuncionarioInput.value; // Usar la referencia correcta
            const idRecurso = idRecursoSelect.value; // Obtén el valor del select (referencia correcta)

             if (!idRecurso || idRecurso === "") { // Verificar que se haya seleccionado una opción válida
                 alert("Por favor, seleccione un recurso.");
                 return; // Detener el envío si no se seleccionó recurso
             }

             // Aquí podrías añadir lógica para verificar 2FA si el backend lo requiere
             // Si 2FA es necesario, quizás no haces el fetch aquí, sino que abres el modal 2FA.

            fetch('registrar_solicitud.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Considera añadir un token CSRF si lo usas por seguridad
                     'X-Requested-With': 'XMLHttpRequest' // Indicativo para el backend de que es una llamada AJAX
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
                     // Podrías necesitar manejar códigos de estado específicos del backend aquí (ej: 409 Conflict si el bloque ya está ocupado)
                     return response.text().then(text => {
                         console.error('HTTP error body:', text); // Log the raw response body
                         throw new Error(`HTTP error! status: ${response.status}, body: ${text.substring(0, 200)}...`); // Limitar longitud del cuerpo en el alert
                     });
                 }
                 return response.json(); // Asume que la respuesta JSON es exitosa o contiene un mensaje de negocio
             })
            .then(data => {
                console.log('Respuesta del servidor (registrar):', data);
                // Manejar la respuesta del backend (éxito, error de negocio, solicitud de 2FA, etc.)
                 if (data.success) {
                     alert(data.message || 'Solicitud registrada con éxito.');
                     modalSolicitud.style.display = 'none';
                     // Recargar la grilla actual después de un registro exitoso
                     const currentSelectedMonth = parseInt(monthSelector.value); // Obtener el mes actual del selector
                     generateGrid(currentSelectedMonth);
                 } else {
                     // Manejar errores de negocio o validación desde el backend
                     // data.message debería contener la razón (ej: "Recurso no disponible", "Permiso denegado")
                     alert('Error al registrar solicitud: ' + (data.message || 'Error desconocido.'));
                 }
            })
            .catch(error => {
                console.error('Error al guardar la solicitud:', error);
                alert('Ocurrió un error al comunicarse con el servidor al registrar la solicitud.');
            });
        });
    }


    // --- Lógica para el botón "Eliminar" (modal original) ---
    // Este listener debería estar activo si el botón existe y la lógica para mostrarlo es correcta
    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => {
            const solicitudId = btnEliminar.dataset.solicitudId; // Obtener el ID almacenado
             if (!solicitudId) {
                 console.warn('No se encontró el ID de la solicitud para eliminar.');
                 alert('No se puede eliminar. Falta el ID de la solicitud.');
                 return;
             }

            if (confirm('¿Está seguro de que desea eliminar esta solicitud?')) {
                 // Realizar la petición al servidor para eliminar la solicitud
                 // Usando POST o GET si DELETE no es compatible fácilmente, o DELETE si tu backend lo soporta
                 fetch(`eliminar_solicitud.php?id=${solicitudId}`, { // Usando query param con ID
                     method: 'POST', // Cambiar a 'DELETE' si el servidor lo soporta
                     headers: {
                          'X-Requested-With': 'XMLHttpRequest' // Indicativo para el backend
                     }
                 })
                 .then(response => {
                      if (!response.ok) {
                          return response.text().then(text => {
                             console.error('HTTP error body:', text);
                             throw new Error(`HTTP error! status: ${response.status}, body: ${text.substring(0, 200)}...`);
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
                          const currentSelectedMonth = parseInt(monthSelector.value); // Obtener el mes actual del selector
                          generateGrid(currentSelectedMonth);
                     } else {
                          alert('Error al eliminar solicitud: ' + (data.message || 'Error desconocido.'));
                     }
                 })
                 .catch(error => {
                     console.error('Error al eliminar la solicitud:', error);
                     alert('Ocurrió un error al comunicarse con el servidor al eliminar la solicitud.');
                 });
            }
        });
    }

    // --- Función para obtener días en el mes ---
    function getDaysInMonth(month, year = new Date().getFullYear()) {
        // Date months are 0-indexed, so month (1-indexed) needs -1
        return new Date(year, month, 0).getDate();
    }

    // --- Función principal para generar la grilla ---
    // month es el número del mes (1-12)
    function generateGrid(month) {
        gridContainer.innerHTML = ''; // Limpiar la grilla anterior

        const daysInMonth = getDaysInMonth(month, currentYear);

        // Crear las cabeceras de los días de la semana
        // (Asumimos 9 columnas: Día, Día Semana, Bloque 1 a 7)
        const headers = ['Día', 'Día Semana', 'Bloque 1', 'Bloque 2', 'Bloque 3', 'Bloque 4', 'Bloque 5', 'Bloque 6', 'Bloque 7'];
        for (let j = 0; j < headers.length; j++) {
            const headerCell = document.createElement('div');
            headerCell.classList.add('grid-item', 'day-column');
            headerCell.textContent = headers[j];
             // Las cabeceras no deben ser clicables para solicitar/ver detalles de bloque
            headerCell.style.cursor = 'default';
            gridContainer.appendChild(headerCell);
        }

        // Calcular fechas de inicio y fin del mes para el fetch
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

                for (let i = 1; i <= daysInMonth; i++) { // Iterar por días del mes (filas)
                    const currentDate = new Date(currentYear, month - 1, i); // month-1 because Date month is 0-indexed
                    const dayOfWeekIndex = currentDate.getDay(); // 0 for Sunday, 6 for Saturday
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
                            cell.dataset.day = i; // Día del mes (para referencia visual si es necesario)
                            cell.dataset.col = j + 1; // Columna en la grilla (1-indexed)
                            cell.dataset.fecha = fechaSolicitud; // Fecha completa AAAA-MM-DD
                            cell.dataset.bloque = numBloque; // Número de bloque (0-6)
                             cell.style.cursor = 'pointer'; // Habilitar cursor pointer para indicar que es clicable

                            // Buscar solicitudes para esta celda específica (fecha y bloque)
                            // Asegúrate de que 'data' contenga la info de Funcionario y Recurso como se discutió
                            const solicitudesEnCelda = data.filter(
                                item => item.FechaSolicitud === fechaSolicitud && parseInt(item.Num_bloque) === numBloque
                            );

                            if (solicitudesEnCelda.length > 0) {
                                // Si hay solicitudes, esta celda está ocupada
                                cell.textContent = "Ver recursos ocupados";
                                cell.style.backgroundColor = 'yellow';
                                // *** Almacenar los datos de las solicitudes en el dataset de la celda ***
                                // Esto es crucial para el modal de detalle
                                cell.dataset.occupations = JSON.stringify(solicitudesEnCelda);
                            } else {
                                // Si no hay solicitudes, la celda está disponible
                                cell.textContent = "Disponible";
                                cell.style.backgroundColor = ''; // Reestablecer color (o a tu color por defecto)
                                delete cell.dataset.occupations; // Asegurarse de que no haya datos de ocupación viejos
                            }

                            // --- Agregar el evento click SOLO a las celdas de bloques (j >= 2) ---
                            cell.addEventListener('click', function() {
                                // No usar preventDefault() aquí a menos que tengas una razón específica
                                // event.preventDefault();

                                const fecha_celda = this.dataset.fecha;
                                const bloque_celda = this.dataset.bloque;
                                console.log(`Celda clicada: Fecha ${fecha_celda}, Bloque ${bloque_celda}`);


                                // Verificar si la celda tiene datos de ocupación almacenados (está ocupada)
                                if (this.dataset.occupations) {
                                    // La celda está ocupada, abrir el modal de detalle
                                    try {
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

                                        // Generar el HTML para cada grupo de recurso en el modal de detalle
                                        for (const recurso in ocupacionesPorRecurso) {
                                            const recursosOcupados = ocupacionesPorRecurso[recurso];

                                            const tituloRecurso = document.createElement('h5');
                                            tituloRecurso.classList.add('detalle-recurso-titulo');
                                            tituloRecurso.textContent = `Recurso: ${recurso}`;
                                            detalleGridContainer.appendChild(tituloRecurso);

                                            // Usar una lista simple para los items de este recurso/bloque
                                            const detalleList = document.createElement('ul');
                                            detalleList.classList.add('list-group', 'mb-3'); // Clases de Bootstrap

                                            recursosOcupados.forEach(solicitud => {
                                                const listItem = document.createElement('li');
                                                listItem.classList.add('list-group-item'); // Clase de Bootstrap
                                                listItem.innerHTML = `
                                                    <strong>Funcionario:</strong> ${solicitud.NombreFuncionario} ${solicitud.ApellidoFuncionario}
                                                    `;
                                                detalleList.appendChild(listItem);
                                            });
                                            detalleGridContainer.appendChild(detalleList); // Agregar la lista al contenedor
                                        }

                                        // Mostrar el nuevo modal de detalle
                                        modalDetalleRecursos.style.display = 'block';

                                    } catch (e) {
                                        console.error('Error al parsear datos de ocupación o generar HTML:', e);
                                        alert('Error al mostrar detalles de ocupación.');
                                    }

                                } else {
                                    // La celda está disponible, abrir el modal de solicitud (comportamiento existente)
                                    console.log(`Celda disponible clicada: Fecha ${fecha_celda}, Bloque ${bloque_celda}`);

                                    // Llenar los campos del modal de solicitud
                                    fechaSolicitadaInput.value = fecha_celda;
                                    bloqueSolicitadoInput.value = bloque_celda;

                                    // Limpiar y obtener recursos para el modal de solicitud
                                     while (idRecursoSelect.options.length > 1) { // Usar la referencia correcta
                                        idRecursoSelect.remove(1);
                                    }
                                     fetch('obtener_recursos.php')
                                     .then(response => {
                                         if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
                                         return response.json();
                                     })
                                    .then(recursos => {
                                         recursos.forEach(recurso => {
                                             const option = document.createElement('option');
                                             option.value = recurso.idRecurso;
                                             option.textContent = recurso.Descrip_Recurso;
                                             idRecursoSelect.appendChild(option); // Usar la referencia correcta
                                         });
                                          // Opcional: asegurarse de que el botón de submit esté habilitado si la carga fue exitosa
                                         // const submitBtn = formularioSolicitud.querySelector('button[type="submit"]');
                                         // if(submitBtn) submitBtn.disabled = false;
                                     })
                                     .catch(error => {
                                         console.error('Error al obtener los recursos:', error);
                                         const optionError = document.createElement('option');
                                         optionError.value = "";
                                         optionError.textContent = "Error al cargar los recursos";
                                         idRecursoSelect.appendChild(optionError); // Usar la referencia correcta
                                          // Deshabilitar el botón de submit si falla la carga de recursos
                                         // const submitBtn = formularioSolicitud.querySelector('button[type="submit"]');
                                         // if(submitBtn) submitBtn.disabled = true;
                                     });


                                    // Ocultar el botón de eliminar en el modal de solicitud (este modal es para CREAR)
                                     if (btnEliminar) {
                                         btnEliminar.style.display = 'none';
                                         delete btnEliminar.dataset.solicitudId; // Limpiar cualquier ID previo
                                     }

                                    // Mostrar el modal de solicitud
                                    modalSolicitud.style.display = 'block';
                                }
                            });
                        }

                        // Marcar fines de semana (aplicable a todas las celdas de la fila)
                        if (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) {
                            cell.classList.add('weekend');
                        }

                        gridContainer.appendChild(cell);
                    }
                }
            })
            .catch(error => {
                console.error('Error al obtener datos mensuales:', error);
                // Mostrar un mensaje de error en la interfaz principal
                gridContainer.innerHTML = '<div class="col-12 text-danger">Error al cargar los datos del calendario. Intente recargar la página.</div>';
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