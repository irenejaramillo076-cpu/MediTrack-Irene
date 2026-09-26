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

    if (!db.Users.Any())
    {
        var initialPassword = Environment.GetEnvironmentVariable("MEDITRACK_ADMIN_PASSWORD");
        if (!string.IsNullOrWhiteSpace(initialPassword))
        {
            var admin = new AppUser { Username = "admin", FullName = "Administrador MediTrack" };
            var hasher = new PasswordHasher<AppUser>();
            admin.PasswordHash = hasher.HashPassword(admin, initialPassword);
            db.Users.Add(admin);
        }
    }

    if (!db.Patients.Any())
    {
        db.Patients.AddRange(
            new Patient { FirstName = "Ana", LastName = "Martínez", Email = "ana@demo.local", Phone = "6000-1001" },
            new Patient { FirstName = "Carlos", LastName = "Gómez", Email = "carlos@demo.local", Phone = "6000-1002" }
        );
    }

    db.SaveChanges();
}

app.Run();
