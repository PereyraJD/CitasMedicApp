using System.ComponentModel.DataAnnotations;

namespace CitasMedicas.Api.DTOs;

public record CrearPacienteDto(
    [Required, MaxLength(100)]
    string Nombre,
    [Required, MaxLength(100)]
    string Apellido,
    [Required, RegularExpression(@"^\d{3}-\d{3}-\d{4}$", ErrorMessage = "El teléfono debe tener el formato 000-000-0000.")]
    string Telefono,
    [Required, RegularExpression(@"^\d{3}-\d{7}-\d$", ErrorMessage = "La cédula debe tener el formato 000-0000000-0.")]
    string Cedula,
    [EmailAddress(ErrorMessage = "El correo no es válido."), MaxLength(100)]
    string? Email,
    [Required(ErrorMessage = "La fecha de nacimiento es obligatoria.")]
    DateOnly? FechaNacimiento
);

public record PacienteDto(
    int Id,
    string Nombre,
    string Apellido,
    string Telefono,
    string Cedula,
    string? Email,
    DateOnly FechaNacimiento,
    string Descripcion
);



