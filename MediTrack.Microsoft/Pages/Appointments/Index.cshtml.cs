using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.Appointments;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    public IndexModel(AppDbContext db) => _db = db;

    public List<Appointment> Appointments { get; private set; } = new();

    public async Task OnGetAsync()
    {
        Appointments = await _db.Appointments
            .AsNoTracking()
            .Include(x => x.Patient)
            .Include(x => x.Doctor)
            .OrderBy(x => x.AppointmentDate)
            .ToListAsync();
    }
}
