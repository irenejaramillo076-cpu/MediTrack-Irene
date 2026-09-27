# MediTrack 360 - Proyecto Final Microsoft

Versión académica de MediTrack preparada para demostrar los requisitos del proyecto final del curso **Herramientas para Desarrollo de Aplicaciones Web** con una interfaz pensada para usuarios reales de una clínica.

## Módulos incluidos

- Inicio / panel general.
- Pacientes.
- Citas médicas.
- Médicos.
- Historial clínico.
- Reportes de actividad.
- Autenticación y cierre de sesión.

## Arquitectura técnica

- Windows Server 2022.
- IIS para publicación web.
- ASP.NET Core 8 / Razor Pages.
- SQL Server Express.
- Entity Framework Core.
- Autenticación mediante cookies.

La información técnica no se muestra al usuario final dentro de la interfaz; queda reservada para la documentación y la sustentación.

## Conexión predeterminada

La aplicación está configurada para la instancia usada en el laboratorio:

`Server=localhost\SQLEXPRESS;Database=MediTrackDB;Trusted_Connection=True;TrustServerCertificate=True;`

Al iniciar, la aplicación verifica y crea las tablas complementarias necesarias para médicos, citas e historial clínico. También agrega datos de demostración si esas tablas están vacías.

## Usuario administrador inicial

La contraseña no se guarda en GitHub. Antes del primer arranque en una instalación nueva configure:

```powershell
$env:MEDITRACK_ADMIN_PASSWORD="SU_CLAVE_DE_DEMO"
```

Usuario inicial:

`admin`

Para dejar la variable persistente en Windows Server:

```powershell
[Environment]::SetEnvironmentVariable("MEDITRACK_ADMIN_PASSWORD", "SU_CLAVE_DE_DEMO", "Machine")
```

## Ejecutar para pruebas

Desde la carpeta `MediTrack.Microsoft`:

```powershell
dotnet restore
dotnet build
dotnet run --no-build
```

La aplicación normalmente quedará disponible en una dirección local indicada por la consola, por ejemplo `http://localhost:5000`.

## Publicar en IIS

Desde la carpeta `MediTrack.Microsoft`:

```powershell
dotnet publish -c Release -o C:\inetpub\wwwroot\MediTrack
```

Luego en IIS:

1. Crear un sitio o aplicación llamado `MediTrack`.
2. Ruta física: `C:\inetpub\wwwroot\MediTrack`.
3. Application Pool: **No Managed Code**.
4. Confirmar que el .NET 8 Hosting Bundle esté instalado.
5. Dar acceso a SQL Server a la identidad usada por IIS, o configurar una cadena de conexión apropiada para el servidor.
6. Iniciar el sitio y probarlo desde el navegador.

## Demostración recomendada

1. Mostrar Windows Server funcionando en VirtualBox.
2. Mostrar IIS instalado.
3. Mostrar SQL Server Management Studio y `MediTrackDB`.
4. Abrir MediTrack.
5. Iniciar sesión.
6. Mostrar el panel principal.
7. Registrar un paciente.
8. Programar una cita.
9. Mostrar el directorio médico.
10. Crear una nota clínica.
11. Mostrar el módulo de reportes.
12. Consultar directamente los registros en SQL Server.
13. Mostrar MediTrack publicado en IIS.

## Capturas recomendadas para el documento

- Windows Server.
- Administrador del servidor con IIS.
- Página de bienvenida de IIS.
- SQL Server Express instalado.
- SSMS conectado a `localhost\SQLEXPRESS`.
- Base `MediTrackDB` y sus tablas.
- Login de MediTrack.
- Panel general.
- Directorio de pacientes.
- Formulario de paciente.
- Agenda de citas.
- Directorio médico.
- Historial clínico.
- Reportes.
- IIS Manager con el sitio MediTrack.
- MediTrack publicado desde IIS.

## Rama del proyecto final

Todo el proyecto Microsoft se encuentra en la rama:

`proyecto-final-microsoft`

La aplicación Node.js original permanece separada y sin modificaciones en la raíz del repositorio.
