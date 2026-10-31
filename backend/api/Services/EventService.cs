using api.DTOs;
using api.Exceptions;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;


namespace api.Services;

public class EventService(IEventRepository repo) : IEventService
{
    public async Task<int> CreateEventAsync(CreateEventDto dto)
    {
        var ev = new Event
        {
            Title = dto.Title,
            StartTime = DateTime.SpecifyKind(dto.StartTime, DateTimeKind.Utc),
            MaxSeats = dto.MaxSeats
        };
        await repo.AddEventAsync(ev);
        await repo.SaveChangesAsync();
        return ev.Id;
    }

    public async Task<EventResponseDto?> GetEventAsync(int id)
    {
        var ev = await repo.GetByIdAsync(id);
        if (ev == null) return null;
        return ToDto(ev, await repo.CountRegistrationsAsync(id));
    }

    public async Task<IEnumerable<EventResponseDto>> GetAllEventsAsync()
    {
        var rows = await repo.GetAllWithTakenAsync();
        return rows.Select(r => ToDto(r.Event, r.Taken)).ToList();
    }

    public async Task<int> RegisterAsync(int eventId, RegisterDto dto)
    {
        await using var tx = await repo.BeginTransactionAsync();

        var ev = await repo.GetByIdForUpdateAsync(eventId) ?? throw new EventNotFoundException();
        // var ev = await repo.GetByIdAsync(eventId) ?? throw new EventNotFoundException();

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

    public async Task<bool> DeleteRegistrationAsync(int eventId, int registrationId)
    {
        var reg = await repo.GetRegistrationAsync(eventId, registrationId);
        if (reg == null) return false;
        repo.RemoveRegistration(reg);
        await repo.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<RegistrationResponseDto>?> GetEventRegistrationsAsync(int eventId)
    {
        if (!await repo.EventExistsAsync(eventId)) return null;
        var regs = await repo.GetRegistrationsAsync(eventId);
        return regs.Select(r => new RegistrationResponseDto(r.Id, r.Name, r.Email, r.CreatedAt)).ToList();
    }

    private static EventResponseDto ToDto(Event ev, int taken) =>
        new(ev.Id, ev.Title, ev.StartTime, ev.MaxSeats, taken, Math.Max(0, ev.MaxSeats - taken));
}