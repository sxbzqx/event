using api.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace api.Interfaces;

public interface IEventRepository
{
    Task<IDbContextTransaction> BeginTransactionAsync();
    Task AddEventAsync(Event ev);
    Task<Event?> GetByIdAsync(int id);
    Task<Event?> GetByIdForUpdateAsync(int id);
    Task<List<(Event Event, int Taken)>> GetAllWithTakenAsync();
    Task<int> CountRegistrationsAsync(int eventId);
    Task<bool> EmailRegisteredAsync(int eventId, string email);
    Task AddRegistrationAsync(Registration registration);
    Task<List<Registration>> GetRegistrationsAsync(int eventId);
    Task<Registration?> GetRegistrationAsync(int eventId, int registrationId);
    void RemoveRegistration(Registration registration);
    Task<bool> EventExistsAsync(int eventId);
    Task SaveChangesAsync();
}