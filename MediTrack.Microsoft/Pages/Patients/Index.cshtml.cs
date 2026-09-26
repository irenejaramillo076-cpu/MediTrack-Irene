using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.Patients;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    public IndexModel(AppDbContext db) => _db = db;

    [BindProperty(SupportsGet = true)]
    public string? Search { get; set; }
    public List<Patient> Patients { get; private set; } = new();

    public async Task OnGetAsync()
    {
        var query = _db.Patients.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(Search))
        {
            query = query.Where(x => x.FirstName.Contains(Search) || x.LastName.Contains(Search) || (x.Email != null && x.Email.Contains(Search)));
        }
        Patients = await query.OrderByDescending(x => x.Id).ToListAsync();
    }
}
