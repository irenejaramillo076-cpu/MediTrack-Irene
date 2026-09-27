using System.ComponentModel.DataAnnotations;

namespace MediTrack.Microsoft.Models;

public class Appointment
{
    public int Id { get; set; }

    [Display(Name = "Paciente")]
    public int PatientId { get; set; }
    public Patient? Patient { get; set; }

    [Display(Name = "Médico")]
    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    [Required, Display(Name = "Fecha y hora")]
    public DateTime AppointmentDate { get; set; }

    [Required, StringLength(180), Display(Name = "Motivo")]
    public string Reason { get; set; } = string.Empty;

    [Required, StringLength(40), Display(Name = "Estado")]
    public string Status { get; set; } = "Programada";
}
