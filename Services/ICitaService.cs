using CitasMedicas.Api.DTOs;

namespace CitasMedicas.Api.Services;

public interface ICitaService
{
    Task<List<CitaDto>> ListarAsync(int? medicoId, DateOnly? fecha);
    Task<CitaDto?> ObtenerPorIdAsync(int id);
    Task<CitaDto> CrearAsync(CrearCitaDto dto);
    Task<CitaDto?> CancelarAsync(int id);
}