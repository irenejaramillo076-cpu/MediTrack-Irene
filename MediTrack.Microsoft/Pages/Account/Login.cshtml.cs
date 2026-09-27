using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using MediTrack.Microsoft.Data;
using MediTrack.Microsoft.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Microsoft.Pages.Account;

public class LoginModel : PageModel
{
    private readonly AppDbContext _db;

    public LoginModel(AppDbContext db) => _db = db;

    [BindProperty]
    public LoginInput Input { get; set; } = new();

    public class LoginInput
    {
        [Required, Display(Name = "Usuario")]
        public string Username { get; set; } = string.Empty;

        [Required, DataType(DataType.Password), Display(Name = "Contraseña")]
        public string Password { get; set; } = string.Empty;
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Username == Input.Username);
        if (user is null)
        {
            ModelState.AddModelError(string.Empty, "Usuario o contraseña incorrectos.");
            return Page();
        }

        var hasher = new PasswordHasher<AppUser>();
        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, Input.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            ModelState.AddModelError(string.Empty, "Usuario o contraseña incorrectos.");
            return Page();
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.NameIdentifier, user.Id.ToString())
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
        return RedirectToPage("/Index");
    }
}
