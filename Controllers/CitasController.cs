using CitasMedicas.Api.DTOs;
using CitasMedicas.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CitasMedicas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitasController : ControllerBase
{
    private readonly ICitaService _service;

    public CitasController(ICitaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<CitaDto>>> Listar([FromQuery] int? medicoId, [FromQuery] DateOnly? fecha)
    {
        var citas = await _service.ListarAsync(medicoId, fecha);
        return Ok(citas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CitaDto>> ObtenerPorId(int id)
    {
        var cita = await _service.ObtenerPorIdAsync(id);
        return cita is null ? NotFound() : Ok(cita);
    }

    [HttpPost]
    public async Task<ActionResult<CitaDto>> Crear(CrearCitaDto dto)
    {
        try
        {
            var creada = await _service.CrearAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.Id }, creada);
        }
        catch (ReglaNegocioException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPatch("{id:int}/cancelar")]
    public async Task<ActionResult<CitaDto>> Cancelar(int id)
    {
        try
        {
            var cita = await _service.CancelarAsync(id);
            return cita is null ? NotFound() : Ok(cita);
        }
        catch (ReglaNegocioException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}