using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.MedicalRecords;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    public IndexModel(AppDbContext db) => _db = db;

    public List<MedicalNote> Notes { get; private set; } = new();

    public async Task OnGetAsync()
    {
        Notes = await _db.MedicalNotes
            .AsNoTracking()
            .Include(x => x.Patient)
            .OrderByDescending(x => x.NoteDate)
            .ToListAsync();
    }
}
