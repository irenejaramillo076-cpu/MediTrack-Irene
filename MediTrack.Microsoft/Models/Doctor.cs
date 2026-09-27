using System.ComponentModel.DataAnnotations;

namespace MediTrack.Microsoft.Models;

public class Doctor
{
    public int Id { get; set; }

    [Required, StringLength(120), Display(Name = "Nombre completo")]
    public string FullName { get; set; } = string.Empty;

    [Required, StringLength(100), Display(Name = "Especialidad")]
    public string Specialty { get; set; } = string.Empty;

    [StringLength(30), Display(Name = "Teléfono")]
    public string? Phone { get; set; }

    [EmailAddress, StringLength(120), Display(Name = "Correo")]
    public string? Email { get; set; }

    public bool Active { get; set; } = true;
}
