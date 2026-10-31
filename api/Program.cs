using api.Data;
using api.Interfaces;
using api.Services;
using api.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Разрешённые origin'ы: по умолчанию локальная разработка,
// в Docker/проде переопределяются переменной Cors__Origins (через запятую)
var corsOrigins = (builder.Configuration["Cors:Origins"]
        ?? "http://localhost:3000,http://localhost:5173,http://localhost:5280")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Применяем миграции при старте (с повторами — БД в контейнере может подниматься дольше API)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    for (var attempt = 1; ; attempt++)
    {
        try
        {
            db.Database.Migrate();
            break;
        }
        catch (Exception ex) when (attempt < 10)
        {
            logger.LogWarning(ex, "База данных недоступна, попытка {Attempt}/10", attempt);
            Thread.Sleep(TimeSpan.FromSeconds(3));
        }
    }
}

// Swagger: всегда в Development, в остальных средах — при Swagger__Enabled=true
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Swagger:Enabled"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// В контейнере TLS нет (его терминирует reverse proxy), поэтому редирект только вне Production
if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

// Обязательно перед UseAuthorization и MapControllers!
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }