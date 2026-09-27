using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.Doctors;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    public IndexModel(AppDbContext db) => _db = db;

    public List<Doctor> Doctors { get; private set; } = new();

    public async Task OnGetAsync()
    {
        Doctors = await _db.Doctors.AsNoTracking().OrderBy(x => x.FullName).ToListAsync();
    }
}
