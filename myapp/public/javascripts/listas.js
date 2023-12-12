$(document).ready(function () {
    // Manejar el cambio en el menú desplegable
    $('#buscarPor').change(function () {
        var selectedOption = $(this).val();

        // Reemplazar el contenido actual del campo de búsqueda global
        $('#busqueda').replaceWith('<input id="busqueda" type="search" class="form-control border-dark rounded" placeholder="Buscar reservas..." name="nombreBuscar" required>');

        if (selectedOption === 'fecha_inicio' || selectedOption === 'fecha_fin') {
            // Si la opción seleccionada es fecha_inicio o fecha_fin, cambiar el tipo de entrada a fecha
            $('#busqueda').attr('type', 'date');
        } else {
            // En caso contrario, volver a cambiar el tipo de entrada a texto
            $('#busqueda').attr('type', 'search');
        }
    });

    // Manejar la presentación correcta del formulario
    $('form').submit(function (event) {
        // Evitar el envío del formulario si hay campos de fecha ocultos
        if ($('#busqueda').attr('type') === 'date' && $('#busqueda').is(':hidden')) {
            event.preventDefault();
            alert('Por favor, selecciona una fecha válida.');
        }
    });
});

// Obtiene todos los elementos con la clase 'abrir-modal-btn'
const abrirModalButtons = document.querySelectorAll('.abrir-modal-btn');

// Obtiene el elemento del botón de confirmar dentro del modal
const confirmarBtn = document.getElementById('confirmarBtn');

// Variable para almacenar el ID del usuario
let userId;

// Agrega un evento de clic a cada botón "Cambiar Rol"
abrirModalButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        event.preventDefault();
        // Obtiene el ID del usuario del atributo de datos
        userId = this.getAttribute('data-id');
        // Abre el modal de confirmación
        const confirmacionModal = new bootstrap.Modal(document.getElementById('confirmacionModal'));
        confirmacionModal.show();
    });
});

// Agrega un evento de clic al botón "Confirmar" dentro del modal
confirmarBtn.addEventListener('click', function (event) {
    // Redirige al endpoint para cambiar el rol con el ID del usuario
    window.location.href = `/home/cambiarRol/${userId}`;
});