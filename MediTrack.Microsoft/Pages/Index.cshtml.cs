using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
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
    public int DoctorCount { get; private set; }
    public int TodayAppointments { get; private set; }
    public int PendingAppointments { get; private set; }
    public List<Appointment> UpcomingAppointments { get; private set; } = new();

    public async Task OnGetAsync()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        PatientCount = await _db.Patients.CountAsync();
        DoctorCount = await _db.Doctors.CountAsync(x => x.Active);
        TodayAppointments = await _db.Appointments.CountAsync(x => x.AppointmentDate >= today && x.AppointmentDate < tomorrow);
        PendingAppointments = await _db.Appointments.CountAsync(x => x.Status == "Programada" || x.Status == "Confirmada");

        UpcomingAppointments = await _db.Appointments
            .AsNoTracking()
            .Include(x => x.Patient)
            .Include(x => x.Doctor)
            .Where(x => x.AppointmentDate >= DateTime.Now)
            .OrderBy(x => x.AppointmentDate)
            .Take(5)
            .ToListAsync();
    }
}
