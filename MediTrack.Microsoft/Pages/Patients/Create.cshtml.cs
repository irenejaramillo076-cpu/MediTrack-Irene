using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MediTrack.Microsoft.Pages.Patients;

[Authorize]
public class CreateModel : PageModel
{
    private readonly AppDbContext _db;
    public CreateModel(AppDbContext db) => _db = db;

    [BindProperty]
    public Patient Patient { get; set; } = new();

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();
        Patient.CreatedAt = DateTime.Now;
        _db.Patients.Add(Patient);
        await _db.SaveChangesAsync();
        TempData["Success"] = "Paciente registrado correctamente.";
        return RedirectToPage("/Patients/Index");
    }
}
