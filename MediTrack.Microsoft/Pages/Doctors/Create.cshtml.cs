using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MediTrack.Microsoft.Pages.Doctors;

[Authorize]
public class CreateModel : PageModel
{
    private readonly AppDbContext _db;
    public CreateModel(AppDbContext db) => _db = db;

    [BindProperty]
    public Doctor Doctor { get; set; } = new();

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();
        Doctor.Active = true;
        _db.Doctors.Add(Doctor);
        await _db.SaveChangesAsync();
        return RedirectToPage("/Doctors/Index");
    }
}
