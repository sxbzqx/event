namespace api.Exceptions;

public class EventNotFoundException() : Exception("Событие не найдено");
public class EventStartedException() : Exception("Событие уже началось");
public class NoSeatsException() : Exception("Нет свободных мест");
public class AlreadyRegisteredException() : Exception("Email уже зарегистрирован");