using CitasMedicas.Api.DTOs;
using CitasMedicas.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CitasMedicas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicosController : ControllerBase
{
    private readonly IMedicoService _service;

    public MedicosController(IMedicoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<MedicoDto>>> Listar()
    {
        var medicos = await _service.ListarAsync();
        return Ok(medicos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MedicoDto>> ObtenerPorId(int id)
    {
        var medico = await _service.ObtenerPorIdAsync(id);
        return medico is null ? NotFound() : Ok(medico);
    }

    [HttpPost]
    public async Task<ActionResult<MedicoDto>> Crear(CrearMedicoDto dto)
    {
        var creado = await _service.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }
}