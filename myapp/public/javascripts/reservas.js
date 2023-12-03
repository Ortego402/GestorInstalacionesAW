
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
    $('#btnGenerarHoras').click(function () {
        var selectedDate = $('#dia').val();
        var esColectivo = $('#tipo').text().trim().split(': ')[1].trim();

        if (esColectivo === 'Colectivo') {
            obtenerHorasDisponibles(selectedDate);
        } else {
            mostrarTodasLasHoras();
        }
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
        // Mostrar todas las horas disponibles para instalación individual
        var horaInicio = $('#horaini').val();
        var horaFin = $('#horafin').val();

        for (var hora = new Date('1970-01-01T' + horaInicio + ':00'); hora <= new Date('1970-01-01T' + horaFin + ':00'); hora.setMinutes(hora.getMinutes() + 30)) {
            var formattedHour = hora.getHours().toString().padStart(2, '0') + ':' + hora.getMinutes().toString().padStart(2, '0');
            var option = $('<option>', {
                value: formattedHour,
                text: formattedHour
            });

            $('#hora').append(option);
        }
        // Mostrar el select después de generar las opciones
        $('#seleccionHoras').show();
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
