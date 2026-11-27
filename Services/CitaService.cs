using CitasMedicas.Api.Data;
using CitasMedicas.Api.DTOs;
using CitasMedicas.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CitasMedicas.Api.Services;

public class CitaService : ICitaService
{
    private readonly CitasDbContext _db;

    public CitaService(CitasDbContext db)
    {
        _db = db;
    }

    public async Task<List<CitaDto>> ListarAsync(int? medicoId, DateOnly? fecha)
    {
        var consulta = _db.Citas
            .AsNoTracking()
            .Include(c => c.Paciente)
            .Include(c => c.Medico)
            .AsQueryable();

        if (medicoId.HasValue)
            consulta = consulta.Where(c => c.MedicoId == medicoId.Value);

        if (fecha.HasValue)
        {
            var inicioDia = fecha.Value.ToDateTime(TimeOnly.MinValue);
            var finDia = inicioDia.AddDays(1);
            consulta = consulta.Where(c => c.FechaHora >= inicioDia && c.FechaHora < finDia);
        }

        var citas = await consulta
            .OrderBy(c => c.FechaHora)
            .ToListAsync();

        return citas.Select(ADto).ToList();
    }

    public async Task<CitaDto?> ObtenerPorIdAsync(int id)
    {
        var cita = await _db.Citas
            .AsNoTracking()
            .Include(c => c.Paciente)
            .Include(c => c.Medico)
            .FirstOrDefaultAsync(c => c.Id == id);

        return cita is null ? null : ADto(cita);
    }

    public async Task<CitaDto> CrearAsync(CrearCitaDto dto)
    {
        var fechaHora = dto.FechaHora!.Value;

        // RN3: no se agendan citas en el pasado
        if (fechaHora <= DateTime.Now)
            throw new ReglaNegocioException("No se puede agendar una cita en una fecha u hora pasada.");

        var paciente = await _db.Pacientes.FindAsync(dto.PacienteId)
            ?? throw new ReglaNegocioException("El paciente seleccionado no existe.");

        var medico = await _db.Medicos.FindAsync(dto.MedicoId)
            ?? throw new ReglaNegocioException("El médico seleccionado no existe.");

        // Dos citas de 30 minutos chocan si sus inicios están a menos de 30 minutos
        var desde = fechaHora.AddMinutes(-Cita.DuracionMinutos);
        var hasta = fechaHora.AddMinutes(Cita.DuracionMinutos);

        // RN1: el médico no puede tener dos citas que se solapen
        bool medicoOcupado = await _db.Citas.AnyAsync(c =>
            c.MedicoId == dto.MedicoId &&
            c.Estado == EstadoCita.Programada &&
            c.FechaHora > desde &&
            c.FechaHora < hasta);

        if (medicoOcupado)
            throw new ReglaNegocioException("El médico ya tiene una cita en ese horario.");

        // RN2: el paciente tampoco puede tener dos citas que se solapen
        bool pacienteOcupado = await _db.Citas.AnyAsync(c =>
            c.PacienteId == dto.PacienteId &&
            c.Estado == EstadoCita.Programada &&
            c.FechaHora > desde &&
            c.FechaHora < hasta);

        if (pacienteOcupado)
            throw new ReglaNegocioException("El paciente ya tiene una cita en ese horario.");

        var cita = new Cita
        {
            Paciente = paciente,
            Medico = medico,
            FechaHora = fechaHora,
            Motivo = dto.Motivo.Trim()
        };

        _db.Citas.Add(cita);
        await _db.SaveChangesAsync();

        return ADto(cita);
    }

    public async Task<CitaDto?> CancelarAsync(int id)
    {
        var cita = await _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Medico)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cita is null)
            return null;

        // RN4: la regla vive dentro de Cita; aquí solo traducimos su error
        try
        {
            cita.Cancelar();
        }
        catch (InvalidOperationException ex)
        {
            throw new ReglaNegocioException(ex.Message);
        }

        await _db.SaveChangesAsync();
        return ADto(cita);
    }

    private static CitaDto ADto(Cita c) => new(
        c.Id,
        c.PacienteId,
        c.Paciente.NombreCompleto,
        c.MedicoId,
        c.Medico.NombreCompleto,
        c.Medico.Especialidad,
        c.FechaHora,
        c.Motivo,
        c.Estado.ToString()
    );
}