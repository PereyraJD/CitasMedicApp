using CitasMedicas.Api.Data;
using CitasMedicas.Api.DTOs;
using CitasMedicas.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CitasMedicas.Api.Services;

public class PacienteService : IPacienteService
{
    private readonly CitasDbContext _db;

    public PacienteService(CitasDbContext db)
    {
        _db = db;
    }

    public async Task<List<PacienteDto>> ListarAsync()
    {
        var pacientes = await _db.Pacientes
            .AsNoTracking()
            .OrderBy(p => p.Apellido)
            .ThenBy(p => p.Nombre)
            .ToListAsync();

        return pacientes.Select(ADto).ToList();
    }

    public async Task<PacienteDto?> ObtenerPorIdAsync(int id)
    {
        var paciente = await _db.Pacientes
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        return paciente is null ? null : ADto(paciente);
    }

    public async Task<PacienteDto> CrearAsync(CrearPacienteDto dto)
    {
        var fechaNacimiento = dto.FechaNacimiento!.Value;

        if (fechaNacimiento > DateOnly.FromDateTime(DateTime.Today))
            throw new ReglaNegocioException("La fecha de nacimiento no puede ser futura.");

        bool cedulaExiste = await _db.Pacientes.AnyAsync(p => p.Cedula == dto.Cedula);
        if (cedulaExiste)
            throw new ReglaNegocioException("Ya existe un paciente registrado con esa cédula.");

        var paciente = new Paciente
        {
            Nombre = dto.Nombre.Trim(),
            Apellido = dto.Apellido.Trim(),
            Telefono = dto.Telefono.Trim(),
            Cedula = dto.Cedula.Trim(),
            Email = dto.Email?.Trim(),
            FechaNacimiento = fechaNacimiento
        };

        _db.Pacientes.Add(paciente);
        await _db.SaveChangesAsync();

        return ADto(paciente);
    }

    private static PacienteDto ADto(Paciente p) => new(
        p.Id,
        p.Nombre,
        p.Apellido,
        p.Telefono,
        p.Cedula,
        p.Email,
        p.FechaNacimiento,
        p.Descripcion
    );
}