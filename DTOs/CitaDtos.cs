using System.ComponentModel.DataAnnotations;

namespace CitasMedicas.Api.DTOs;

public record CrearCitaDto(
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un paciente.")]
    int PacienteId,
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un médico.")]
    int MedicoId,
    [Required(ErrorMessage = "La fecha y hora son obligatorias.")]
    DateTime? FechaHora,
    [Required, MaxLength(200)]
    string Motivo
);

public record CitaDto(
    int Id,
    int PacienteId,
    string Paciente,
    int MedicoId,
    string Medico,
    string Especialidad,
    DateTime FechaHora,
    string Motivo,
    string Estado
);