# MediTrack 360 - Proyecto Final Microsoft

Versión académica de MediTrack preparada para demostrar los requisitos del proyecto final del curso **Herramientas para Desarrollo de Aplicaciones Web**.

## Arquitectura

- Windows Server 2019/2022/2025 o Windows 10/11 para laboratorio
- IIS como servidor de publicación web
- ASP.NET Core 8 / Razor Pages
- SQL Server
- Entity Framework Core
- Autenticación mediante cookies

## Funcionalidades demostrables

1. Pantalla de inicio de sesión.
2. Validación del usuario contra la tabla `Users` de SQL Server.
3. Página principal después de iniciar sesión.
4. Formulario de registro de pacientes.
5. Almacenamiento de pacientes en SQL Server.
6. Consulta y búsqueda de pacientes desde la base de datos.
7. Cierre de sesión.

## 1. Requisitos en el servidor

Instalar:

- IIS.
- .NET 8 Hosting Bundle para IIS.
- SQL Server.
- SQL Server Management Studio (recomendado para demostrar la base de datos).
- Visual Studio 2022 con la carga de trabajo **ASP.NET y desarrollo web**, o .NET 8 SDK.

## 2. Crear la base de datos

La aplicación usa por defecto:

`Server=localhost;Database=MediTrackDB;Trusted_Connection=True;TrustServerCertificate=True;`

Entity Framework crea automáticamente las tablas `Users` y `Patients` al iniciar por primera vez.

Si IIS utiliza una identidad que no tiene acceso a SQL Server, configure una cadena de conexión apropiada mediante la variable de entorno `ConnectionStrings__DefaultConnection` o conceda permisos al Application Pool sobre `MediTrackDB`.

## 3. Crear el administrador inicial

Por seguridad la contraseña no se guarda en GitHub. Antes del primer inicio configure una variable de entorno en Windows Server:

```powershell
$env:MEDITRACK_ADMIN_PASSWORD="SU_CLAVE_DE_DEMO"
```

El usuario inicial será `admin`. En el primer arranque la aplicación guardará la contraseña como hash en SQL Server.

Para una variable persistente en el servidor puede usar:

```powershell
[Environment]::SetEnvironmentVariable("MEDITRACK_ADMIN_PASSWORD", "SU_CLAVE_DE_DEMO", "Machine")
```

Después reinicie IIS o la sesión correspondiente.

## 4. Ejecutar desde Visual Studio

Abra `MediTrack.Microsoft.csproj`, restaure paquetes y ejecute el proyecto. También puede usar:

```powershell
dotnet restore
dotnet run
```

## 5. Publicar para IIS

Desde la carpeta `MediTrack.Microsoft`:

```powershell
dotnet publish -c Release -o C:\inetpub\wwwroot\MediTrack
```

En IIS:

1. Cree un sitio o aplicación llamado `MediTrack`.
2. Apunte la ruta física a `C:\inetpub\wwwroot\MediTrack`.
3. Configure el Application Pool con **No Managed Code**.
4. Verifique que el .NET Hosting Bundle esté instalado.
5. Inicie el sitio y abra la dirección asignada.

El archivo `web.config` incluido está preparado para ASP.NET Core Module V2.

## Capturas recomendadas para el documento

- Windows Server funcionando en VirtualBox o servidor elegido.
- Server Manager mostrando IIS instalado.
- SQL Server/SSMS mostrando `MediTrackDB`.
- Tabla `Users`.
- Tabla `Patients`.
- Visual Studio con el proyecto abierto.
- Pantalla de login.
- Dashboard posterior al login.
- Formulario de registro.
- Paciente guardado.
- Consulta/listado de pacientes.
- IIS Manager mostrando el sitio MediTrack.
- Navegador mostrando MediTrack publicado desde IIS.

## Flujo para la sustentación

1. Mostrar Windows Server.
2. Mostrar IIS y explicar que publica la aplicación.
3. Mostrar SQL Server y las tablas.
4. Abrir MediTrack desde el navegador.
5. Iniciar sesión con el usuario almacenado en SQL Server.
6. Registrar un paciente.
7. Consultar el paciente en el listado.
8. Mostrar el registro directamente en SQL Server.
9. Explicar brevemente problemas encontrados y cómo se resolvieron.

La aplicación se mantiene intencionalmente pequeña para demostrar de forma clara servidor, publicación web, autenticación, formulario y consulta de base de datos.
