using CitasMedicas.Api.Data;
using CitasMedicas.Api.DTOs;
using CitasMedicas.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CitasMedicas.Api.Services;

public class MedicoService : IMedicoService
{
    private readonly CitasDbContext _db;

    public MedicoService(CitasDbContext db)
    {
        _db = db;
    }

    public async Task<List<MedicoDto>> ListarAsync()
    {
        var medicos = await _db.Medicos
            .AsNoTracking()
            .OrderBy(m => m.Apellido)
            .ThenBy(m => m.Nombre)
            .ToListAsync();

        return medicos.Select(ADto).ToList();
    }

    public async Task<MedicoDto?> ObtenerPorIdAsync(int id)
    {
        var medico = await _db.Medicos
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        return medico is null ? null : ADto(medico);
    }

    public async Task<MedicoDto> CrearAsync(CrearMedicoDto dto)
    {
        var medico = new Medico
        {
            Nombre = dto.Nombre.Trim(),
            Apellido = dto.Apellido.Trim(),
            Telefono = dto.Telefono.Trim(),
            Especialidad = dto.Especialidad.Trim()
        };

        _db.Medicos.Add(medico);
        await _db.SaveChangesAsync();

        return ADto(medico);
    }

    private static MedicoDto ADto(Medico m) => new(
        m.Id,
        m.Nombre,
        m.Apellido,
        m.Telefono,
        m.Especialidad,
        m.Descripcion
    );
}