
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
        $('#hora').empty();
        // Hacer la petición AJAX para obtener las reservas
        $.ajax({
            url: '/obtener_horas_disponibles',
            method: 'POST',
            data: { instalacionId: instalacionId, fecha: fecha },
            success: function (data) {
                var reservas = data.horasDisponibles;
                console.log(reservas)
                // Mostrar todas las horas disponibles para instalación individual
                for (var hora = new Date('1970-01-01T' + horaInicio + ':00'); hora <= new Date('1970-01-01T' + horaFin + ':00'); hora.setMinutes(hora.getMinutes() + 30)) {
                    var formattedHour = hora.getHours().toString().padStart(2, '0') + ':' + hora.getMinutes().toString().padStart(2, '0');
                    // Contar el número de reservas para esta hora
                    var numReservas = reservas.filter(reserva => reserva.hora === formattedHour).length;

                    // Verificar si el número de reservas es igual al aforo
                    var isDisabled = numReservas >= parseInt($('#aforo').val());
    
                    var option = $('<option>', {
                        value: formattedHour,
                        text: formattedHour,
                        disabled: isDisabled
                    });
    
                    // Si está deshabilitado, aplicar estilos
                    if (isDisabled) {
                        option.css('background-color', 'grey');
                        option.css('color', 'white');
                    }
    
                    $('#hora').append(option);
                }
                var todasDeshabilitadas = $('#hora option:disabled').length === $('#hora option').length;

                if (todasDeshabilitadas) {
                    // Mostrar mensaje al usuario
                    $('#mensajeReservado').text('¡Todas las horas están reservadas! Apuntándote a la lista de espera, se le notificará cuando una reserva sea anulada.');
        
                    // Mostrar botón para unirse a la lista de espera
                    $('#btnListaEspera').show();
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
        $('#hora').empty();
        for (var hora = new Date('1970-01-01T' + horaInicio + ':00'); hora <= new Date('1970-01-01T' + horaFin + ':00'); hora.setMinutes(hora.getMinutes() + 30)) {
            var formattedHour = hora.getHours().toString().padStart(2, '0') + ':' + hora.getMinutes().toString().padStart(2, '0');
            var isDisabled = data.some(item => item.hora === formattedHour);
            var option = $('<option>', {
                value: formattedHour,
                text: formattedHour,
                disabled: isDisabled
            });
            if (isDisabled) {
                option.css('background-color', 'grey');
                option.css('color', 'white');
            }
            $('#hora').append(option);
        }
    
        // Verificar si todas las opciones están deshabilitadas
        var todasDeshabilitadas = $('#hora option:disabled').length === $('#hora option').length;
    
        if (todasDeshabilitadas) {
            // Mostrar mensaje al usuario
            $('#mensajeReservado').text('¡Todas las horas están reservadas! Apuntándote a la lista de espera, se le notificará cuando una reserva sea anulada.');
    
            // Mostrar botón para unirse a la lista de espera
            $('#btnListaEspera').show();
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

