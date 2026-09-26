using MediTrack.Microsoft.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    public IndexModel(AppDbContext db) => _db = db;
    public int PatientCount { get; private set; }

    public async Task OnGetAsync()
    {
        PatientCount = await _db.Patients.CountAsync();
    }
}
