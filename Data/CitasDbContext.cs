using CitasMedicas.Api.Models;
using Microsoft.EntityFrameworkCore;


namespace CitasMedicas.Api.Data;

    public class CitasDbContext : DbContext
    {
        public CitasDbContext(DbContextOptions<CitasDbContext> options) : base(options)
        {
        }

        public DbSet<Paciente> Pacientes => Set<Paciente>();
        public DbSet<Medico> Medicos => Set<Medico>();
        public DbSet<Cita> Citas => Set<Cita>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Paciente>(entity =>
            {
                entity.Property(p => p.Nombre)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(p => p.Apellido)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(p => p.Telefono)
                    .IsRequired()
                    .HasMaxLength(20);
                entity.Property(p => p.Cedula)
                    .IsRequired()
                    .HasMaxLength(13);
                entity.Property(p => p.Email)
                    .HasMaxLength(100);

                entity.HasIndex(p => p.Cedula)
                    .IsUnique();
            });
            
            modelBuilder.Entity<Medico>(entity =>
            {
                entity.Property(m => m.Nombre)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(m => m.Apellido)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(m => m.Telefono)
                    .IsRequired()
                    .HasMaxLength(20);
                entity.Property(m => m.Especialidad)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            modelBuilder.Entity<Cita>(entity =>
            {
                entity.Property(c => c.Motivo)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(c => c.FechaHora)
                    .HasColumnType("timestamp without time zone");

                entity.Property(c => c.Estado)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                entity.HasOne(c => c.Paciente)
                    .WithMany(p => p.Citas)
                    .HasForeignKey(c => c.PacienteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Medico)
                    .WithMany(p => p.Citas)
                    .HasForeignKey(c => c.MedicoId)
                    .OnDelete(DeleteBehavior.Restrict);

            });

    }
        
    }

