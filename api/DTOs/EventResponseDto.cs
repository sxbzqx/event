namespace api.DTOs;

public record EventResponseDto(
    int Id,
    string Title,
    DateTime StartTime,
    int MaxSeats,
    int TakenSeats,
    int FreeSeats
);