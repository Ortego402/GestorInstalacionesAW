Funcionalidades del Administrador

FALTAN=>
-editar organizacion no funciona
-cambiar rol
-realizar reserva

app.get('/reserva/:id', (req, res) => {
  const id = req.params.id;
  const reservaConfirmada = req.query.reserva === 'confirmada';

  // Mensaje que se mostrará en función de la confirmación de reserva o comentario
  let mensaje = '';
  if (reservaConfirmada) {
    mensaje = '¡Reserva completada! Gracias por realizar la reserva.';
  } else {
    mensaje = '¡Ups! Ha ocurrido un error al realizar la acción.';
  }

  // Realiza una consulta a la base de datos para obtener detalles del destino y sus imágenes y comentarios asociados
  dbConnection.query('SELECT * FROM UCM_AW_RIU_INS_Instalaciones WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error de la base de datos' });
    }

    if (result.length === 0) {
      return res.status(404).send('Destino no encontrado');
    }
    
    res.render('reserva', { result: result[0], session: req.session});

  });
});

app.get('/cambiarRol/:id', (req, res) => {
  const id = req.params.id;

  // Realiza una consulta para obtener el rol actual del usuario
  dbConnection.query('SELECT rol FROM UCM_AW_RIU_USU_Usuarios WHERE Id = ?', [id], (err, results) => {
    if (err) {
      // Maneja los errores de la base de datos aquí
      console.error(err);
      return res.status(500).json({ error: 'Error de la base de datos' });
    }

    // Obtiene el rol actual del resultado de la consulta
    const rolActual = results[0].rol;
    // Cambia el rol de '1' a '0' o de '0' a '1' según el valor actual
    const nuevoRol = rolActual === '1' ? '0' : '1';
    // Realiza una consulta de actualización para cambiar el rol
    dbConnection.query('UPDATE UCM_AW_RIU_USU_Usuarios SET rol = ? WHERE Id = ?', [nuevoRol, id], (err, result) => {
      if (err) {
        // Maneja los errores de la base de datos aquí
        console.error(err);
        return res.status(500).json({ error: 'Error de la base de datos al actualizar el rol' });
      }
      
      // Redirige a la página de lista de usuarios después de cambiar el rol
      res.redirect('/usuarios');
    });
  });
});

0. He cambiado en el nav populares por Validacion asi cada vez que se meta un usuario en la app 
al admin le llegara una solicitud ahi para acpetar o declinar, si la acpeta le enviamos un correo a su correo normal
0.1 Funciona lo de la imagen ya se guarda en la bbdd, he cambiado perfil y he añadido organizacion

mostrar imagen perfil 
                        <!-- <div class="avatar-container"> -->
                            <!-- Imagen de perfil en un círculo -->
                            <!-- <img src="data:image/jpg;base64, <%= session.imagen.toString('base64') %>" alt="Imagen de perfil" class="avatar"> -->
                        <!-- </div> -->

1. Configuración del Sistema:
a. Personalizar la apariencia del sistema con nombre, dirección e icono de la
organización.
2. Gestión de Instalaciones:
a. Crear nuevas instalaciones con nombre, disponibilidad horaria, tipo de reserva
(individual o colectiva), y aforo (si aplica).
b. Adjuntar fotografía/icono a la instalación.
3. Validación de Usuarios:
a. Validar registros de usuarios nuevos para permitir su acceso a la plataforma.
b. Enviar correo de confirmación de registro a los usuarios validados.
4. Asignación de Roles:
a. Asignar roles de administrador a usuarios específicos.
5. Estadísticas y Listados:
a. Obtener estadísticas de reservas por usuario o por facultad.
b. Generar listados de usuarios por facultad.
6. Comunicación Interna:
a. Enviar mensajes a usuarios a través de un buzón de correo interno.
7. Gestión de lista de espera:
a. Se enviará una notificación al primer usuario de la lista cuando haya habido alguna
cancelación de reservas.

Funcionalidades del Usuario
1. Registro de Usuarios:
a. Registrarse en la plataforma proporcionando información como nombre, apellidos,
facultad, curso, grupo, contraseña, contraseña visible e imagen de perfil.
2. Reserva de Instalaciones:
a. Realizar reservas de instalaciones seleccionando fecha y hora deseada.
3. Correo Electrónico:
a. Ver correos electrónicos recibidos.
b. Enviar correos a otros usuarios de la misma organización.

Funcionalidades Comunes
1. Inicio de Sesión:
a. Iniciar sesión en la plataforma utilizando correo de la UCM y contraseña.
2. Cierre de Sesión:
a. Cerrar sesión mediante un icono o opción en el menú desplegable.

Funcionalidades según la nota:
5
● Aplicación: Responsive
● Administrador: Configuración del sistema
● Administrador: Creación de instalación
● Usuario: Registro de usuario
● Administrador: Validación de usuario
● Administrador y Usuario: Inicio de sesión
● Administrador y Usuario: Cierre de sesión
● Usuario: Reserva de instalaciones
● Administrador: Historial de reservas de un
usuario o de una instalación.
● Ventanas modales

6
● Todas las anteriores
● Administrador: Envío de correo de validación de usuario
● Administrador: Envío de mensajes a cualquier usuario dentro de la misma Organización
● Administrador: Envío de mensajes a cualquier usuario dentro de la misma Facultad.
● Usuario: Envío de correo tanto al administrador como a cualquier otro usuario de la Organización.

8
● Todas las anteriores
● Administrador: Búsqueda avanzada. Desarrollar estructura de filtros para listados
    ○ Nombre usuario
    ○ Apellido usuario
    ○ Fecha inicio
    ○ Fecha fin
    ○ Facultad
    ○ Instalación
● Administrador: Generar listado de usuarios
● Administrador: Generar listado de reservas

10
● Todas las anteriores
● Administrador y Usuario: Calendario interactivo de disponibilidad
● Administrador: Gestionar la Lista de espera
● Refactorización de código