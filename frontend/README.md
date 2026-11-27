# CitasMedicApp · Frontend

Aplicación Angular para consultar el Dashboard y la Agenda, registrar pacientes y médicos, y agendar, consultar y cancelar citas.

## Requisitos

- Node.js 20.19+, 22.12+ o 24 y npm.
- SDK de .NET 10, Entity Framework CLI 10 y PostgreSQL para ejecutar la API del repositorio.
- Chromium de Playwright para las pruebas de extremo a extremo.

## Desarrollo local

1. Crea una base PostgreSQL para la aplicación. Por ejemplo:

   ```bash
   docker run --name citasmedic-db -d -p 127.0.0.1:5432:5432 \
     -e POSTGRES_DB=citasmedicas -e POSTGRES_PASSWORD=citas_local postgres:17-alpine
   ```

2. Desde la raíz del repositorio, configura la conexión y aplica las migraciones existentes. Usa la zona horaria de la clínica en el host de la API y en el equipo desde el que se gestionan las citas.

   ```bash
   export ConnectionStrings__CitasDb='Host=localhost;Port=5432;Database=citasmedicas;Username=postgres;Password=citas_local'
   export TZ=America/Santo_Domingo
   dotnet tool install --global dotnet-ef --version '10.*'
   dotnet ef database update --project CitasMedicas.Api.csproj
   dotnet run --project CitasMedicas.Api.csproj --launch-profile http
   ```

   Si ya tienes `dotnet-ef` 10, omite su instalación. La API de desarrollo se inicia en `http://localhost:5258`.

3. En otra terminal, ejecuta Angular:

   ```bash
   cd frontend
   npm ci
   npm start
   ```

   Abre [http://localhost:4200](http://localhost:4200). El proxy de Angular dirige `/api/*` a la API.

## Compilación y pruebas

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

Ejecuta las pruebas con Angular y la API activos y con una base de datos de pruebas. La suite registra pacientes, médicos y citas sintéticos en PostgreSQL y deja esos registros en la base. Usa `CITAS_TEST_URL` para cambiar el puerto del frontend y `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para usar una instalación local de Chromium.

Publica el contenido de `dist/citasmedicapp/browser/` en un servidor estático con fallback a `index.html` para las rutas de Angular. Configura el reenvío de `/api/*` al backend bajo el mismo origen.

## Arquitectura

- `src/app/features/` agrupa Dashboard, Agenda, Pacientes, Médicos y Citas en rutas con carga diferida.
- `src/app/core/` contiene los DTOs, el cliente HTTP y el estado de consultas con Signals y RxJS.
- `src/app/layouts/` contiene la navegación de escritorio y móvil. `src/app/shared/` contiene el directorio compartido y la respuesta visual a cargas y errores.
- Los formularios reactivos comprueban formatos, campos requeridos y fechas. La API aplica las reglas de duplicados, solapamientos y cancelación. `fechaNacimiento` se envía como `yyyy-MM-dd` y `fechaHora` como fecha y hora local sin sufijo de zona.

| Recurso | Endpoints utilizados |
| --- | --- |
| Pacientes | `GET /api/pacientes`, `GET /api/pacientes/{id}`, `POST /api/pacientes` |
| Médicos | `GET /api/medicos`, `GET /api/medicos/{id}`, `POST /api/medicos` |
| Citas | `GET /api/citas` con filtros opcionales `medicoId` y `fecha`, `GET /api/citas/{id}`, `POST /api/citas`, `PATCH /api/citas/{id}/cancelar` |
