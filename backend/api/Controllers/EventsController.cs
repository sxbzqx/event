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

    /// <summary>
    /// Создание события
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || dto.MaxSeats <= 0)
            return BadRequest(new { error = "Invalid event data" });

        if (dto.Description?.Length > 1000)
            return BadRequest(new { error = "Descript must be at most 1000 characters."});

        var id = await _eventService.CreateEventAsync(dto);
        return StatusCode(201, new { id });
    }

    /// <summary>
    /// Получение всех событый 
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllEvents()
    {
        var events = await _eventService.GetAllEventsAsync();
        return Ok(events);
    }

    /// <summary>
    /// Получение конкретного события  
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetEvent(int id)
    {
        var ev = await _eventService.GetEventAsync(id);
        if (ev == null)
            return NotFound(new { error = "Cобытие не найдено" });

        return Ok(ev);
    }

    /// <summary>
    /// Список тех, кто уже записался на конкретное событие
    /// </summary>
    [HttpGet("{id:int}/registrations")]
    public async Task<IActionResult> GetEventRegistrations(int id)
    {
        var registrations = await _eventService.GetEventRegistrationsAsync(id);
        if (registrations == null)
            return NotFound(new { error = "Event not found" });

        return Ok(registrations);
    }
}