$(document).ready(function () {
    $('#destinatario').on('input', function () {
        const email = $(this).val();
        // Realizar la solicitud AJAX al servidor
        $.ajax({
            type: 'GET',
            url: '/validarEmail',
            data: { email: email },
            success: function (response) {
                // Mostrar mensaje debajo del input (ajusta según tu HTML)
                $('#mensajeError').text(response.error || '').css('color', 'red');
                // Deshabilitar o habilitar el botón de enviar según la respuesta
                if (response.error) {
                    $('#enviarEmailForm button[type="submit"]').prop('disabled', true);
                } else {
                    $('#enviarEmailForm button[type="submit"]').prop('disabled', false);
                }
            },
            error: function (error) {
                console.error('Error en la solicitud AJAX:', error);
            }
        });
    });
});