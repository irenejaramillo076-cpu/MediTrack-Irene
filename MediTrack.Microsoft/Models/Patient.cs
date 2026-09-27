using System.ComponentModel.DataAnnotations;

namespace MediTrack.Microsoft.Models;

public class Patient
{
    public int Id { get; set; }

    [Required, StringLength(80), Display(Name = "Nombre")]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(80), Display(Name = "Apellido")]
    public string LastName { get; set; } = string.Empty;

    [EmailAddress, StringLength(120), Display(Name = "Correo electrónico")]
    public string? Email { get; set; }

    [StringLength(30), Display(Name = "Teléfono")]
    public string? Phone { get; set; }

    [DataType(DataType.Date), Display(Name = "Fecha de nacimiento")]
    public DateTime? BirthDate { get; set; }

    [Display(Name = "Fecha de registro")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
