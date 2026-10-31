using api.DTOs;

namespace api.Interfaces;

public interface IEventService
{
    Task<int> CreateEventAsync(CreateEventDto dto);
    Task<EventResponseDto?> GetEventAsync(int id);
    Task<int> RegisterAsync(int eventId, RegisterDto dto);
    Task<bool> DeleteRegistrationAsync(int eventId, int registrationId);
    Task<IEnumerable<RegistrationResponseDto>?> GetEventRegistrationsAsync(int eventId);
    Task<IEnumerable<EventResponseDto>> GetAllEventsAsync();
}