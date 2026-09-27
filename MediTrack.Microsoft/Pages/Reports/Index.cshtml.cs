using MediTrack.Microsoft.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.Reports;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    public IndexModel(AppDbContext db) => _db = db;

    public int PatientCount { get; private set; }
    public int AppointmentCount { get; private set; }
    public int CompletedCount { get; private set; }
    public int ClinicalNoteCount { get; private set; }
    public List<DoctorActivityRow> DoctorActivity { get; private set; } = new();

    public async Task OnGetAsync()
    {
        PatientCount = await _db.Patients.CountAsync();
        AppointmentCount = await _db.Appointments.CountAsync();
        CompletedCount = await _db.Appointments.CountAsync(x => x.Status == "Completada");
        ClinicalNoteCount = await _db.MedicalNotes.CountAsync();

        DoctorActivity = await _db.Doctors.AsNoTracking()
            .OrderBy(x => x.FullName)
            .Select(x => new DoctorActivityRow
            {
                DoctorName = x.FullName,
                Specialty = x.Specialty,
                AppointmentCount = _db.Appointments.Count(a => a.DoctorId == x.Id)
            })
            .ToListAsync();
    }

    public class DoctorActivityRow
    {
        public string DoctorName { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public int AppointmentCount { get; set; }
    }
}
