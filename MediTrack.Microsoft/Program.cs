using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/Login";
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
    });
builder.Services.AddAuthorization();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapRazorPages();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID('dbo.Doctors', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Doctors(
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FullName NVARCHAR(120) NOT NULL,
        Specialty NVARCHAR(100) NOT NULL,
        Phone NVARCHAR(30) NULL,
        Email NVARCHAR(120) NULL,
        Active BIT NOT NULL CONSTRAINT DF_Doctors_Active DEFAULT(1)
    );
END;

IF OBJECT_ID('dbo.Appointments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Appointments(
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PatientId INT NOT NULL,
        DoctorId INT NOT NULL,
        AppointmentDate DATETIME2 NOT NULL,
        Reason NVARCHAR(180) NOT NULL,
        Status NVARCHAR(40) NOT NULL,
        CONSTRAINT FK_Appointments_Patients FOREIGN KEY(PatientId) REFERENCES dbo.Patients(Id),
        CONSTRAINT FK_Appointments_Doctors FOREIGN KEY(DoctorId) REFERENCES dbo.Doctors(Id)
    );
END;

IF OBJECT_ID('dbo.MedicalNotes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MedicalNotes(
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PatientId INT NOT NULL,
        NoteDate DATETIME2 NOT NULL,
        Diagnosis NVARCHAR(180) NOT NULL,
        Treatment NVARCHAR(240) NULL,
        Notes NVARCHAR(1200) NULL,
        CONSTRAINT FK_MedicalNotes_Patients FOREIGN KEY(PatientId) REFERENCES dbo.Patients(Id) ON DELETE CASCADE
    );
END;
");

    if (!db.Users.Any())
    {
        var initialPassword = Environment.GetEnvironmentVariable("MEDITRACK_ADMIN_PASSWORD");
        if (!string.IsNullOrWhiteSpace(initialPassword))
        {
            var admin = new AppUser { Username = "admin", FullName = "Administrador MediTrack" };
            var hasher = new PasswordHasher<AppUser>();
            admin.PasswordHash = hasher.HashPassword(admin, initialPassword);
            db.Users.Add(admin);
            db.SaveChanges();
        }
    }

    if (!db.Patients.Any())
    {
        db.Patients.AddRange(
            new Patient { FirstName = "Ana", LastName = "Martínez", Email = "ana@demo.local", Phone = "6000-1001" },
            new Patient { FirstName = "Carlos", LastName = "Gómez", Email = "carlos@demo.local", Phone = "6000-1002" }
        );
        db.SaveChanges();
    }

    if (!db.Doctors.Any())
    {
        db.Doctors.AddRange(
            new Doctor { FullName = "Dra. Laura Mendoza", Specialty = "Medicina General", Phone = "6000-2201", Email = "laura.mendoza@meditrack.local" },
            new Doctor { FullName = "Dr. Javier Torres", Specialty = "Pediatría", Phone = "6000-2202", Email = "javier.torres@meditrack.local" },
            new Doctor { FullName = "Dra. Sofía Ríos", Specialty = "Cardiología", Phone = "6000-2203", Email = "sofia.rios@meditrack.local" }
        );
        db.SaveChanges();
    }

    if (!db.Appointments.Any() && db.Patients.Any() && db.Doctors.Any())
    {
        var patient = db.Patients.OrderBy(x => x.Id).First();
        var doctor = db.Doctors.OrderBy(x => x.Id).First();
        db.Appointments.Add(new Appointment
        {
            PatientId = patient.Id,
            DoctorId = doctor.Id,
            AppointmentDate = DateTime.Today.AddDays(1).AddHours(9),
            Reason = "Consulta de control",
            Status = "Programada"
        });
        db.SaveChanges();
    }
}

app.Run();
