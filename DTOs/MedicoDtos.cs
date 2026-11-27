using System.ComponentModel.DataAnnotations;

namespace CitasMedicas.Api.DTOs;

public record CrearMedicoDto(
    [Required, MaxLength(100)]
    string Nombre,
    [Required, MaxLength(100)]
    string Apellido,
    [Required, RegularExpression(@"^\d{3}-\d{3}-\d{4}$", ErrorMessage = "El teléfono debe tener el formato 000-000-0000.")]
    string Telefono,
    [Required, MaxLength(100)]
    string Especialidad
);

public record MedicoDto(
    int Id,
    string Nombre,
    string Apellido,
    string Telefono,
    string Especialidad,
    string Descripcion
);