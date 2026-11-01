using System.ComponentModel;
using api.DTOs;
using api.Exceptions;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;


namespace api.Services;

public class EventService(IEventRepository repo) : IEventService
{   
    // Создание события
    public async Task<int> CreateEventAsync(CreateEventDto dto)
    {
        var ev = new Event
        {
            Title = dto.Title,
            StartTime = DateTime.SpecifyKind(dto.StartTime, DateTimeKind.Utc),
            MaxSeats = dto.MaxSeats,
            Description = dto.Description?.Trim()
        };
        await repo.AddEventAsync(ev);
        await repo.SaveChangesAsync();
        return ev.Id;
    }

    // Событие [id]
    public async Task<EventResponseDto?> GetEventAsync(int id)
    {
        var ev = await repo.GetByIdAsync(id);
        if (ev == null) return null;
        return ToDto(ev, await repo.CountRegistrationsAsync(id));
    }
    
    // События [все]
    public async Task<IEnumerable<EventResponseDto>> GetAllEventsAsync()
    {
        var rows = await repo.GetAllWithTakenAsync();
        return rows.Select(r => ToDto(r.Event, r.Taken)).ToList();
    }

    // Регистрация 
    public async Task<int> RegisterAsync(int eventId, RegisterDto dto)
    {
        await using var tx = await repo.BeginTransactionAsync();

        var ev = await repo.GetByIdForUpdateAsync(eventId) ?? throw new EventNotFoundException();
        // var ev = await repo.GetByIdAsync(eventId) ?? throw new EventNotFoundException(); // для тестов

        if (DateTime.UtcNow >= ev.StartTime) throw new EventStartedException();
        if (await repo.CountRegistrationsAsync(eventId) >= ev.MaxSeats) throw new NoSeatsException();
        if (await repo.EmailRegisteredAsync(eventId, dto.Email)) throw new AlreadyRegisteredException();

        var registration = new Registration { EventId = eventId, Name = dto.Name, Email = dto.Email };
        await repo.AddRegistrationAsync(registration);

        try
        {
            await repo.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            throw new AlreadyRegisteredException();
        }

        await tx.CommitAsync();
        return registration.Id;
    }

    // Удаление зарегистрированных 
    public async Task<bool> DeleteRegistrationAsync(int eventId, int registrationId)
    {
        var reg = await repo.GetRegistrationAsync(eventId, registrationId);
        if (reg == null) return false;
        repo.RemoveRegistration(reg);
        await repo.SaveChangesAsync();
        return true;
    }

    // Получение зарегистрированных
    public async Task<IEnumerable<RegistrationResponseDto>?> GetEventRegistrationsAsync(int eventId)
    {
        if (!await repo.EventExistsAsync(eventId)) return null;
        var regs = await repo.GetRegistrationsAsync(eventId);
        return regs.Select(r => new RegistrationResponseDto(r.Id, r.Name, r.Email, r.CreatedAt)).ToList();
    }

    // Получение данных о событии
    private static EventResponseDto ToDto(Event ev, int taken) =>
        new(ev.Id, ev.Title, ev.StartTime, ev.MaxSeats, taken, Math.Max(0, ev.MaxSeats - taken), ev.Description);
}