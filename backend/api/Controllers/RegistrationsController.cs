using api.DTOs;
using api.Exceptions;
using api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/events")]
public class RegistrationsController(IEventService eventService) : ControllerBase
{
    [HttpPost("{id:int}/registrations")]
    public async Task<IActionResult> Register(int id, [FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { error = "Name and email are required" });

        try
        {
            var regId = await eventService.RegisterAsync(id, dto);
            return StatusCode(201, new { registration_id = regId });
        }
        catch (EventNotFoundException) { return NotFound(new { error = "Event not found" }); }
        catch (EventStartedException ex) { return BadRequest(new { error = ex.Message }); }
        catch (NoSeatsException ex) { return Conflict(new { error = ex.Message }); }
        catch (AlreadyRegisteredException ex) { return Conflict(new { error = ex.Message }); }
    }

    [HttpDelete("{id:int}/registrations/{registrationId:int}")]
    public async Task<IActionResult> DeleteRegistration(int id, int registrationId)
    {
        var success = await eventService.DeleteRegistrationAsync(id, registrationId);
        return success ? NoContent() : NotFound(new { error = "Registration or event not found" });
    }
}