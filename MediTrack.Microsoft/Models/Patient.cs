using System.ComponentModel.DataAnnotations;

namespace MediTrack.Microsoft.Models;

public class Patient
{
    public int Id { get; set; }

    [Required, StringLength(80)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(80)]
    public string LastName { get; set; } = string.Empty;

    [EmailAddress, StringLength(120)]
    public string? Email { get; set; }

    [StringLength(30)]
    public string? Phone { get; set; }

    [DataType(DataType.Date)]
    public DateTime? BirthDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
