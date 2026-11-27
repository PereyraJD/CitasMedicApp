using CitasMedicas.Api.DTOs;

namespace CitasMedicas.Api.Services;

public interface IMedicoService
{
    Task<List<MedicoDto>> ListarAsync();
    Task<MedicoDto?> ObtenerPorIdAsync(int id);
    Task<MedicoDto> CrearAsync(CrearMedicoDto dto);
}