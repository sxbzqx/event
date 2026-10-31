namespace api.DTOs;

public class CreateEventDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public int MaxSeats { get; set; }
}