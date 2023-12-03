
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
    });

    function updateHourOptions(data, horaInicio, horaFin) {
        $('#hora').empty();
        for (var hora = new Date('1970-01-01T' + horaInicio + ':00'); hora <= new Date('1970-01-01T' + horaFin + ':00'); hora.setMinutes(hora.getMinutes() + 30)) {
            var formattedHour = hora.getHours().toString().padStart(2, '0') + ':' + hora.getMinutes().toString().padStart(2, '0');
            var isDisabled = data.some(item => item.hora === formattedHour);
            $('#hora').append('<option value="' + formattedHour + '" ' + (isDisabled ? 'disabled' : '') + '>' + formattedHour + '</option>');
        }
    }

    function validarFormulario() {
        var fechaReserva = new Date(document.getElementById('dia').value);
        var fechaActual = new Date();
        // Compara las fechas
        if (fechaReserva < fechaActual) {
            alert('La fecha de reserva debe ser posterior a la fecha actual.');
            return false; // Evita que el formulario se envíe
        }
        return true; // Permite que el formulario se envíe
    }
});


