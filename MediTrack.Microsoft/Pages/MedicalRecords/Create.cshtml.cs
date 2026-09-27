using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.MedicalRecords;

[Authorize]
public class CreateModel : PageModel
{
    private readonly AppDbContext _db;
    public CreateModel(AppDbContext db) => _db = db;

    [BindProperty]
    public MedicalNote Note { get; set; } = new() { NoteDate = DateTime.Now };

    public List<SelectListItem> PatientOptions { get; private set; } = new();

    public async Task OnGetAsync() => await LoadPatientsAsync();

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            await LoadPatientsAsync();
            return Page();
        }

        _db.MedicalNotes.Add(Note);
        await _db.SaveChangesAsync();
        return RedirectToPage("/MedicalRecords/Index");
    }

    private async Task LoadPatientsAsync()
    {
        PatientOptions = await _db.Patients.AsNoTracking()
            .OrderBy(x => x.FirstName).ThenBy(x => x.LastName)
            .Select(x => new SelectListItem($"{x.FirstName} {x.LastName}", x.Id.ToString()))
            .ToListAsync();
    }
}
