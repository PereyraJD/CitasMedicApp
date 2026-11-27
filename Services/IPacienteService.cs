using CitasMedicas.Api.DTOs;

namespace CitasMedicas.Api.Services;

public interface IPacienteService
{
    Task<List<PacienteDto>> ListarAsync();
    Task<PacienteDto?> ObtenerPorIdAsync(int id);
    Task<PacienteDto> CrearAsync(CrearPacienteDto dto);
}