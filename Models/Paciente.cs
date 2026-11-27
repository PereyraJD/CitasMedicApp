namespace CitasMedicas.Api.Models
{
    public class Paciente : Persona
    {
        public string Cedula { get; set; } = string.Empty;
        public string? Email { get; set; }
        public DateOnly FechaNacimiento { get; set; }

        public List<Cita> Citas { get; set; } = new();

        public override string Descripcion => $"{NombreCompleto} - Cédula: {Cedula}";
    }
}
