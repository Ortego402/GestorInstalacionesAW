
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
                    console.log(formattedHour)
                    // Contar el número de reservas para esta hora
                    var numReservas = reservas.filter(reserva => reserva.hora === formattedHour).length;
                    console.log(numReservas)

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
    }
});

