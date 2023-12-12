// Validar email para mandar el correo
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

// Modal para enviar respuesta a un correo
document.addEventListener('DOMContentLoaded', function () {
    // Obtén los datos del correo
    const destinatario = '<%= result.correo_envia %>'; // Asigna el correo del remitente
    const asunto = 'Re: <%= result.asunto %>'; // Agrega "Re:" al asunto original

    // Rellena el modal al hacer clic en el botón Responder
    const responderBtn = document.getElementById('responderBtn');
    responderBtn.addEventListener('click', function () {
        const destinatarioInput = document.getElementById('destinatario');
        const asuntoInput = document.getElementById('asunto');

        destinatarioInput.value = destinatario;
        asuntoInput.value = asunto;
    });
});

// Ver email individual
document.addEventListener('DOMContentLoaded', function () {
    const emailRows = document.querySelectorAll('.email-item');

    // Al hacer click habre el email 
    emailRows.forEach(function (row) {
        row.addEventListener('click', function () {
            const url = row.getAttribute('data-href');
            window.location.href = url;
        });
    });
});