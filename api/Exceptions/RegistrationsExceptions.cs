namespace api.Exceptions;

public class EventNotFoundException() : Exception("Event not found");
public class EventStartedException() : Exception("Event has already started");
public class NoSeatsException() : Exception("No seats available");
public class AlreadyRegisteredException() : Exception("Email already registered");