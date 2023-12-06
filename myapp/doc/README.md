FALTA POR HACER:
-Poner lo de miga de pan donde no haya y haga falta (miga de pan es: Home / Perfil)
-Responsive:
    -Home HECHO
    -Email HECHO
    -Email individual HECHO
    -Error HECHO
    -Footer HECHO
    -Header
    -Instalacion HECHO
    -ListarReservas HECHO
    -ListarUsuarios HECHO
    -Login HECHO
    -MostrarReservas HECHO
    -Nav
    -Organización HECHO
    -Perfil HECHO
    -Registro HECHO
    -Reserva (Falta las cards de las horas que salen mal, y la lista de reservas salen cortadas)
    -Validacion HECHO
    -Validado HECHO

SET GLOBAL max_allowed_packet=67108864;
Funcionalidades del Administrador
# 1. Configuración del Sistema: a. Personalizar la apariencia del sistema con nombre, dirección e icono de la organización.
# 2. Gestión de Instalaciones: a. Crear nuevas instalaciones con nombre, disponibilidad horaria, tipo de reserva (individual o colectiva), y aforo (si aplica). b. Adjuntar fotografía/icono a la instalación.
# 3. Validación de Usuarios:
# a. Validar registros de usuarios nuevos para permitir su acceso a la plataforma.
# b. Enviar correo de confirmación de registro a los usuarios validados.
# 4. Asignación de Roles: a. Asignar roles de administrador a usuarios específicos.
# 5. Estadísticas y Listados: a. Obtener estadísticas de reservas por usuario o por facultad. b. Generar listados de usuarios por facultad.
# 6. Comunicación Interna: a. Enviar mensajes a usuarios a través de un buzón de correo interno.
# 7. Gestión de lista de espera: a. Se enviará una notificación al primer usuario de la lista cuando haya habido alguna cancelación de reservas.

Funcionalidades del Usuario
# 1. Registro de Usuarios: a. Registrarse en la plataforma proporcionando información como nombre, apellidos, facultad, curso, grupo, contraseña, contraseña visible e imagen de perfil.
# 2. Reserva de Instalaciones: a. Realizar reservas de instalaciones seleccionando fecha y hora deseada.
# 3. Correo Electrónico: a. Ver correos electrónicos recibidos. b. Enviar correos a otros usuarios de la misma organización.

Funcionalidades Comunes
# 1. Inicio de Sesión: Iniciar sesión en la plataforma utilizando correo de la UCM y contraseña.
# 2. Cierre de Sesión: Cerrar sesión mediante un icono o opción en el menú desplegable.


Funcionalidades según la nota:
5
● Aplicación: Responsive (Se revisa casi al final)
# ● Administrador: Configuración del sistema
# ● Administrador: Creación de instalación
# ● Usuario: Registro de usuario
# ● Administrador: Validación de usuario
# ● Administrador y Usuario: Inicio de sesión
# ● Administrador y Usuario: Cierre de sesión
# ● Usuario: Reserva de instalaciones (Falta formato para reserva)
# ● Administrador: Historial de reservas de un usuario.
# ● Administrador: Historial de reservas de una instalación.
# ● Ventanas modales

6
● Todas las anteriores
# ● Administrador: Envío de correo de validación de usuario
# ● Administrador: Envío de mensajes a cualquier usuario dentro de la misma Organización
# ● Administrador: Envío de mensajes a cualquier usuario dentro de la misma Facultad.
# ● Usuario: Envío de correo tanto al administrador como a cualquier otro usuario de la Organización.

8
● Todas las anteriores
# ● Administrador: Búsqueda avanzada. Desarrollar estructura de filtros para listados
# ○ Nombre usuario
# ○ Apellido usuario
# ○ Fecha inicio
# ○ Fecha fin
# ○ Facultad
# ○ Instalación
# ● Administrador: Generar listado de usuarios
# ● Administrador: Generar listado de reservas

10
● Todas las anteriores
# ● Administrador y Usuario: Calendario interactivo de disponibilidad
# ● Administrador: Gestionar la Lista de espera
# ● Refactorización de código