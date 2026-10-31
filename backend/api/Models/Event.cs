namespace api.Models;

public class Event
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public int MaxSeats { get; set; }
    
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}
