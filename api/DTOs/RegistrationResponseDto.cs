namespace api.DTOs;

public record RegistrationResponseDto(
    int Id,
    string Name,
    string Email,
    DateTime CreatedAt
);