using System.ComponentModel.DataAnnotations;

namespace MediTrack.Microsoft.Models;

public class MedicalNote
{
    public int Id { get; set; }

    [Display(Name = "Paciente")]
    public int PatientId { get; set; }
    public Patient? Patient { get; set; }

    [Display(Name = "Fecha")]
    public DateTime NoteDate { get; set; } = DateTime.Now;

    [Required, StringLength(180), Display(Name = "Diagnóstico")]
    public string Diagnosis { get; set; } = string.Empty;

    [StringLength(240), Display(Name = "Tratamiento")]
    public string? Treatment { get; set; }

    [StringLength(1200), Display(Name = "Observaciones")]
    public string? Notes { get; set; }
}
