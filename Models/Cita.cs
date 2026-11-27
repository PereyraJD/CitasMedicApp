namespace CitasMedicas.Api.Models;

public class Cita
{
    public const int DuracionMinutos = 30;
    public int Id { get; set; }
    public int PacienteId { get; set; }
    public Paciente Paciente { get; set; } = null!;
    public int MedicoId { get; set; }
    public Medico Medico { get; set; } = null!;
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public EstadoCita Estado { get; private set; } = EstadoCita.Programada; // Programada, Cancelada, Completada

    public void Cancelar()
    {
        if (Estado != EstadoCita.Programada)
        {
            throw new InvalidOperationException("Solo se pueden cancelar citas programadas.");
        }

        Estado = EstadoCita.Cancelada;
    }
}
