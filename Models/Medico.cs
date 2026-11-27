namespace CitasMedicas.Api.Models
{
    public class Medico : Persona
    {
        public string Especialidad { get; set; } = string.Empty;
        public List<Cita> Citas { get; set; } = new();
        public override string Descripcion => $"Dr. {NombreCompleto}  ({Especialidad})";
    }
}
