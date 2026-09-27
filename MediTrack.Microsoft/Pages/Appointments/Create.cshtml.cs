using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.Appointments;

[Authorize]
public class CreateModel : PageModel
{
    private readonly AppDbContext _db;
    public CreateModel(AppDbContext db) => _db = db;

    [BindProperty]
    public Appointment Appointment { get; set; } = new() { AppointmentDate = DateTime.Now.AddDays(1) };

    public List<SelectListItem> PatientOptions { get; private set; } = new();
    public List<SelectListItem> DoctorOptions { get; private set; } = new();

    public async Task OnGetAsync() => await LoadOptionsAsync();

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            await LoadOptionsAsync();
            return Page();
        }

        _db.Appointments.Add(Appointment);
        await _db.SaveChangesAsync();
        return RedirectToPage("/Appointments/Index");
    }

    private async Task LoadOptionsAsync()
    {
        PatientOptions = await _db.Patients.AsNoTracking()
            .OrderBy(x => x.FirstName).ThenBy(x => x.LastName)
            .Select(x => new SelectListItem($"{x.FirstName} {x.LastName}", x.Id.ToString()))
            .ToListAsync();

        DoctorOptions = await _db.Doctors.AsNoTracking()
            .Where(x => x.Active)
            .OrderBy(x => x.FullName)
            .Select(x => new SelectListItem($"{x.FullName} · {x.Specialty}", x.Id.ToString()))
            .ToListAsync();
    }
}
