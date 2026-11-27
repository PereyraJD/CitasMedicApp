namespace CitasMedicas.Api.Models
{
    public abstract class Persona
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;

        public string NombreCompleto => $"{Nombre} {Apellido}";
        public abstract string Descripcion { get; }

    }
}
