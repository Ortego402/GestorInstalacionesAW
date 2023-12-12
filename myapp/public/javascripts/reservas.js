
function confirmarEliminarReserva(idReserva) {
    var inputReservaId = document.getElementById('reservaIdInput');
    inputReservaId.value = idReserva;

    var modal = new bootstrap.Modal(document.getElementById('confirmarEliminarReservaModal'));
    modal.show();
}

function cerrarModal() {
    $('#confirmarEliminarReservaModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
}

$(document).ready(function () {
    // Captura el evento change del input de fecha #dia
    $('#dia').change(function () {
        var selectedDate = $(this).val();
        var esColectivo = $('#tipo').text().trim().split(': ')[1].trim();

        if (esColectivo === 'Colectivo') {
            obtenerHorasDisponibles(selectedDate);
        } else {
            mostrarTodasLasHoras();
        }

        // Oculta el botón después de realizar la acción
        $('#btnGenerarHoras').hide();
    });

    function obtenerHorasDisponibles(selectedDate) {
        $.ajax({
            url: '/obtener_horas_disponibles',
            method: 'POST',
            data: { fecha: selectedDate, instalacionId: $('#instalacionId').val() },
            success: function (data) {
                var horasDisponibles = data.horasDisponibles;
                updateHourOptions(horasDisponibles, $('#horaini').val(), $('#horafin').val());
                // Mostrar el select después de generar las opciones
                $('#seleccionHoras').show();
            },
            error: function () {
                console.error('Error al obtener las horas disponibles.');
            }
        });
    }

    function mostrarTodasLasHoras() {
        // Obtener información necesaria
        var instalacionId = $('#instalacionId').val();
        var fecha = $('#dia').val();
        var horaInicio = $('#horaini').val();
        var horaFin = $('#horafin').val();
        $('#horaContainer').empty(); // Limpiar el contenedor de horas
    
        // Hacer la petición AJAX para obtener las reservas
        $.ajax({
            url: '/obtener_horas_disponibles',
            method: 'POST',
            data: { instalacionId: instalacionId, fecha: fecha },
            success: function (data) {
                var reservas = data.horasDisponibles;
                var todasDeshabilitadas = true;
                // Mostrar horas como tarjetas
                for (var hora = new Date('1970-01-01T' + horaInicio + ':00'); hora <= new Date('1970-01-01T' + horaFin + ':00'); hora.setMinutes(hora.getMinutes() + 30)) {
                    var formattedHour = hora.getHours().toString().padStart(2, '0') + ':' + hora.getMinutes().toString().padStart(2, '0');
                    var numReservas = reservas.filter(reserva => reserva.hora === formattedHour).length;
                    var isDisabled = numReservas >= parseInt($('#aforo').val());
    
                    if (!isDisabled) {
                        todasDeshabilitadas = false;
                    }

                    var cardClass = isDisabled ? 'bg-danger text-black' : 'bg-primary text-black';
    
                    var card = $('<button>', {
                        type: 'button',
                        class: 'mx-2 fixed-width-card ' + cardClass,  // Agrega la clase fixed-width-card
                        html: '<div class="card-body text-center">' + formattedHour + '</div>'
                    });
                    
    
                    // Asignar el evento de clic a la tarjeta utilizando "on" fuera de la función click
                    card.click(handleCardClick);
    
                    // Agregar la tarjeta al contenedor
                    $('#horaContainer').append(card);
                }
                // var todasDeshabilitadas = $('#horaContainer .card:disabled').length === $('#horaContainer .card').length;

                if (todasDeshabilitadas) {
                    if ($('#btnListaEspera').prop('disabled')) {
                        // Button is disabled, do not show the message
                        $('#mensajeReservado').text('Te has apuntado a la lista de espera con éxito.');
        
                    } else {
                        // Button is enabled, show the message
                        $('#mensajeReservado').text('¡Todas las horas están reservadas! Apuntándote a la lista de espera, se le notificará cuando una reserva sea anulada.');
                    }
                    // Mostrar botón para unirse a la lista de espera
                    $('#btnListaEspera').show();
                } else {
                    // Ocultar mensaje y botón de lista de espera si hay al menos una hora disponible
                    $('#mensajeReservado').text('');
                    $('#btnListaEspera').hide();
                }
                
                // Mostrar el select después de generar las opciones
                $('#seleccionHoras').show();
            },
            error: function () {
                console.error('Error al obtener las reservas.');
            }
        });
    }
    

    function updateHourOptions(data, horaInicio, horaFin) {
        var horaContainer = $('#horaContainer');
        horaContainer.empty();
    
        var todasDeshabilitadas = true;
    
        for (var hora = new Date('1970-01-01T' + horaInicio + ':00'); hora <= new Date('1970-01-01T' + horaFin + ':00'); hora.setMinutes(hora.getMinutes() + 30)) {
            var formattedHour = hora.getHours().toString().padStart(2, '0') + ':' + hora.getMinutes().toString().padStart(2, '0');
            var isDisabled = data.some(item => item.hora === formattedHour);
    
            if (!isDisabled) {
                todasDeshabilitadas = false;
            }
    
            var cardClass = isDisabled ? 'bg-danger text-black' : 'bg-primary text-black'; // Clase de tarjeta roja si está ocupada
    
            var card = $('<button>', {
                type: 'button',
                class: 'mx-2 fixed-width-card ' + cardClass,  // Agrega la clase fixed-width-card
                html: '<div class="card-body text-center">' + formattedHour + '</div>'
            });
            

            horaContainer.append(card);
    
            // Asignar el evento de clic a la tarjeta utilizando "on" fuera de la función click
            card.click(handleCardClick);
        }
    
        // Verificar si todas las tarjetas están deshabilitadas
        if (todasDeshabilitadas) {
            if ($('#btnListaEspera').prop('disabled')) {
                // Button is disabled, do not show the message
                $('#mensajeReservado').text('Te has apuntado a la lista de espera con éxito.');

            } else {
                // Button is enabled, show the message
                $('#mensajeReservado').text('¡Todas las horas están reservadas! Apuntándote a la lista de espera, se le notificará cuando una reserva sea anulada.');
            }
            // Mostrar botón para unirse a la lista de espera
            $('#btnListaEspera').show();
        } else {
            // Ocultar mensaje y botón de lista de espera si hay al menos una hora disponible
            $('#mensajeReservado').text('');
            $('#btnListaEspera').hide();
        }
    }

    function handleCardClick() {
        // Reset the background color for all cards
        $('.card').removeClass('selected bg-black');
    
        var formattedHour = $(this).text();  // Obtener el texto del botón, que es la hora
        var isDisabled = $(this).hasClass('bg-danger');
    
        if (!isDisabled && !$(this).hasClass('selected')) {
            // Eliminar la clase 'selected' de todas las tarjetas
            $('.card').removeClass('selected');
    
            // Añadir la clase 'selected' a la tarjeta actual
            $(this).addClass('selected');
    
            // Establecer la hora seleccionada en el campo oculto
            $('#hora').val(formattedHour);
    
            // Cambiar el color de fondo de la tarjeta seleccionada a un tono más oscuro
            $(this).addClass('selected bg-black');
        }
    }
    
    // Evento para unirse a la lista de espera
    $('#btnListaEspera').on('click', function () {
        apuntarseListaEspera();
    });
    

    function apuntarseListaEspera() {
        // Deshabilitar el botón después de hacer clic
        $('#btnListaEspera').prop('disabled', true);
    
        // Realizar la solicitud POST a /lista_espera
        $.ajax({
            url: '/lista_espera',
            method: 'POST',
            data: { fecha: $('#dia').val(), instalacionId: $('#instalacionId').val(), usuario: $('#usuario').val() },
            success: function (response) {
                // Éxito: mostrar mensaje de éxito al usuario en verde
                mostrarMensaje(response.success, response.message, 'success');
            },
            error: function () {
                // Error de red u otro: mostrar mensaje de error al usuario en rojo
                mostrarMensaje(false, 'Error al apuntarse en la lista de espera.', 'error');
            }
        });
    }
    
    function mostrarMensaje(esExito, mensaje, tipo) {
        // Limpiar cualquier estilo anterior
        $('#mensajeReservado').removeClass('text-success text-danger');
    
        // Agregar estilo según el tipo (success o error)
        if (tipo === 'success') {
            $('#mensajeReservado').addClass('text-success');
        } else if (tipo === 'error') {
            $('#mensajeReservado').addClass('text-danger');
        }
    
        // Mostrar el mensaje
        $('#mensajeReservado').text(mensaje);
    }   
    
});

function validarFormulario() {
    var horaSeleccionada = $('#hora').val();

    if (!horaSeleccionada) {
        // Muestra un mensaje de error
        mostrarMensaje('Por favor, selecciona una hora válida.');
        return false;
    }

    // Resto de la lógica de validación (si la tienes)

    // Si todo está bien, permite que el formulario se envíe
    return true;
}

function mostrarMensaje(mensaje) {
    // Construye la estructura del mensaje con la clase de contenedor adicional
    var mensajeHtml = '<div class="mensaje-container"><div class="alert alert-danger  bg-danger bg-gradient text-black">' + mensaje + '</div></div>';

    // Inserta el mensaje en el contenedor
    $('#mensaje-container').html(mensajeHtml);

    // Limpia el mensaje después de unos segundos (puedes ajustar este tiempo)
    setTimeout(function() {
        $('#mensaje-container').empty();
    }, 3000); // 3000 milisegundos = 3 segundos
}

setTimeout(function() {
    document.getElementById('mensaje-exitoerror').innerHTML = '';
}, 3000);

