
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