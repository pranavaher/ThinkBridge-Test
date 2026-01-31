using Microsoft.AspNetCore.Mvc;

namespace BuggyApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    [HttpGet]
    public IActionResult GetData()
    {
        // Placeholder endpoint that won't throw.
        return Ok(new { message = "Data fetched" });
    }
}

