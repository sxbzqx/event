using api.DTOs;
using api.Interfaces;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || dto.MaxSeats <= 0)
            return BadRequest(new { error = "Invalid event data" });

        var id = await _eventService.CreateEventAsync(dto);
        return StatusCode(201, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllEvents()
    {
        var events = await _eventService.GetAllEventsAsync();
        return Ok(events);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetEvent(int id)
    {
        var ev = await _eventService.GetEventAsync(id);
        if (ev == null)
            return NotFound(new { error = "Event not found" });

        return Ok(ev);
    }

    // Новый эндпоинт: список тех, кто уже записался на конкретное событие
    [HttpGet("{id:int}/registrations")]
    public async Task<IActionResult> GetEventRegistrations(int id)
    {
        var registrations = await _eventService.GetEventRegistrationsAsync(id);
        if (registrations == null)
            return NotFound(new { error = "Event not found" });

        return Ok(registrations);
    }
}