var passwordInput = document.getElementById('password');
var showPasswordBtn = document.getElementById('showPasswordBtn');

// Boton para mostrar la contraseña
showPasswordBtn.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordBtn.textContent = 'Ocultar';
    } else {
        passwordInput.type = 'password';
        showPasswordBtn.textContent = 'Mostrar';
    }
});

// Validar grupo que sea solo una letra mayúscula
function validateGroup(input) {
    var regex = /^[A-Z]+$/;
    var errorMessage = document.getElementById('groupError');
    if (!regex.test(input.value)) {
        errorMessage.textContent = 'Debe ser una única letra mayúscula.';
        input.setCustomValidity('Debe ser una única letra mayúscula.'); // Invalida el campo para que no se envíe el formulario
    } else {
        errorMessage.textContent = ''; // Borra el mensaje de error
        input.setCustomValidity(''); // Restablece la validez del campo
    }
}

// Validar grupo que sea solo una letra mayúscula
function validateGroup(input) {
    var regex = /^[A-Z]+$/;
    var errorMessage = document.getElementById('groupError');
    if (!regex.test(input.value)) {
        errorMessage.textContent = 'Debe ser una única letra mayúscula.';
        input.setCustomValidity('Debe ser una única letra mayúscula.'); // Invalida el campo para que no se envíe el formulario
    } else {
        errorMessage.textContent = ''; // Borra el mensaje de error
        input.setCustomValidity(''); // Restablece la validez del campo
    }
}

// Validar email sea de la UCM
function validateEmail(input) {
    var regex = /^[A-Za-z0-9._%+-]+@ucm\.es$/;
    var errorMessage = document.getElementById('emailError');

    if (!regex.test(input.value)) {
        errorMessage.textContent = 'El email debe pertenecer a la UCM.';
        input.setCustomValidity('Invalid');
    } else {
        errorMessage.textContent = '';
        input.setCustomValidity('');
    }
}

// Validar la password con la características necesarias
function validatePassword(input) {
    var password = input.value;
    var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    var errorMessage = document.getElementById('passwordError');

    if (!regex.test(password)) {
        errorMessage.textContent = 'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.';
        input.setCustomValidity('Invalid');
    } else {
        errorMessage.textContent = '';
        input.setCustomValidity('');
    }
}

// Validar la password que coincida con la anterior
function validateConfirmPassword(input) {
    var password = document.getElementById('password').value;
    var confirmPassword = input.value;
    var errorMessage = document.getElementById('confirmPasswordError');

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Las contraseñas no coinciden.';
        input.setCustomValidity('Invalid');
    } else {
        errorMessage.textContent = '';
        input.setCustomValidity('');
    }
}

var passwordInput = document.getElementById('password');
var showPasswordBtn = document.getElementById('showPasswordBtn');
var passwordInput2 = document.getElementById('confirmPassword');
var showPasswordBtn2 = document.getElementById('showPasswordBtn2');

// Agrega el event listener fuera de la función
showPasswordBtn.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordBtn.textContent = 'Ocultar';
    } else {
        passwordInput.type = 'password';
        showPasswordBtn.textContent = 'Mostrar';
    }
});

// Agrega el event listener fuera de la función
showPasswordBtn2.addEventListener('click', function () {
    if (passwordInput2.type === 'password') {
        passwordInput2.type = 'text';
        showPasswordBtn2.textContent = 'Ocultar';
    } else {
        passwordInput2.type = 'password';
        showPasswordBtn2.textContent = 'Mostrar';
    }
});

// Obtiene todos los elementos con la clase 'abrir-modal-btn'
const abrirModalButtons = document.querySelectorAll('.abrir-modal-btn');
const abrirModalButtons2 = document.querySelectorAll('.abrir-modal-btn2');

// Obtiene el elemento del botón de confirmar dentro del modal
const confirmarBtn = document.getElementById('confirmarBtn');
const confirmarBtn2 = document.getElementById('confirmarBtn2');

// Variables para almacenar el ID y el correo electrónico del usuario
let userId;
let userEmail;

// Función para abrir el modal de confirmación
function abrirModal(event, modalId) {
    event.preventDefault();
    // Obtiene el ID y el correo electrónico del usuario del atributo de datos
    userId = event.target.getAttribute('data-id');
    userEmail = event.target.getAttribute('data-email');
    // Abre el modal de confirmación
    const confirmacionModal = new bootstrap.Modal(document.getElementById(modalId));
    confirmacionModal.show();
}

// Agrega un evento de clic a cada botón "Validar"
abrirModalButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        abrirModal(event, 'validarModal_' + this.getAttribute('data-id'));
    });
});

// Agrega un evento de clic a cada botón "Denegar"
abrirModalButtons2.forEach(button => {
    button.addEventListener('click', function (event) {
        abrirModal(event, 'denegarModal_' + this.getAttribute('data-id'));
    });
});

// Agrega un evento de clic al botón "Confirmar" dentro del modal de Validar
confirmarBtn.addEventListener('click', function (event) {
    // Redirige al endpoint para cambiar el rol con el ID y correo electrónico del usuario
    window.location.href = `/home/validar/${userId}?email=${userEmail}`;
});

// Agrega un evento de clic al botón "Confirmar" dentro del modal de Denegar
confirmarBtn2.addEventListener('click', function (event) {
    // Redirige al endpoint para cambiar el rol con el ID y correo electrónico del usuario
    window.location.href = `/home/novalidar/${userId}?email=${userEmail}`;
});
