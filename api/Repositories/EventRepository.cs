using api.Data;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace api.Repositories;

public class EventRepository(AppDbContext db) : IEventRepository
{
    public Task<IDbContextTransaction> BeginTransactionAsync() => db.Database.BeginTransactionAsync();

    public async Task AddEventAsync(Event ev) => await db.Events.AddAsync(ev);

    public Task<Event?> GetByIdAsync(int id) => db.Events.FirstOrDefaultAsync(e => e.Id == id);

    public Task<Event?> GetByIdForUpdateAsync(int id) =>
        db.Events
            .FromSqlInterpolated($"SELECT * FROM \"Events\" WHERE \"Id\" = {id} FOR UPDATE")
            .FirstOrDefaultAsync();

    public async Task<List<(Event Event, int Taken)>> GetAllWithTakenAsync()
    {
        var rows = await db.Events
            .OrderBy(e => e.StartTime)
            .Select(e => new { Event = e, Taken = e.Registrations.Count })
            .ToListAsync();
        return rows.Select(r => (r.Event, r.Taken)).ToList();
    }

    public Task<int> CountRegistrationsAsync(int eventId) =>
        db.Registrations.CountAsync(r => r.EventId == eventId);

    public Task<bool> EmailRegisteredAsync(int eventId, string email) =>
        db.Registrations.AnyAsync(r => r.EventId == eventId && r.Email == email);

    public async Task AddRegistrationAsync(Registration registration) =>
        await db.Registrations.AddAsync(registration);

    public Task<List<Registration>> GetRegistrationsAsync(int eventId) =>
        db.Registrations.Where(r => r.EventId == eventId).OrderBy(r => r.CreatedAt).ToListAsync();

    public Task<Registration?> GetRegistrationAsync(int eventId, int registrationId) =>
        db.Registrations.FirstOrDefaultAsync(r => r.Id == registrationId && r.EventId == eventId);

    public void RemoveRegistration(Registration registration) => db.Registrations.Remove(registration);

    public Task<bool> EventExistsAsync(int eventId) => db.Events.AnyAsync(e => e.Id == eventId);

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}