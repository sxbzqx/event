using api.Data;
using api.Interfaces;
using api.Repositories;
using api.Services;
using Microsoft.EntityFrameworkCore;

namespace api.Exceptions;

public static class StartupExtensions
{   
    private const string CorsPolicy = "AllowFrontend";

    // CORS 
    public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration config)
    {
        var origins = (config["Cors:Origins"]
                ?? "http://localhost:3000,http://localhost:5173,http://localhost:5280") 
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return services.AddCors(options =>
            options.AddPolicy(CorsPolicy, policy =>
                policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));
    }

    // Коннект к БД
    public static IServiceCollection AddAppDatabase(this IServiceCollection services, IConfiguration config) =>
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

    // Регистрация сервисов
    public static IServiceCollection AddAppServices(this IServiceCollection services)
    {
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IEventService, EventService>();
        return services;
    }

    // Накатывание Миграций
    public static void ApplyMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        for (var attempt = 1; ; attempt++)
        {
            try
            {
                db.Database.Migrate();
                return;
            }
            catch (Exception ex) when (attempt < 10)
            {
                logger.LogWarning(ex, "База данных недоступна, попытка {Attempt}/10", attempt);
                Thread.Sleep(TimeSpan.FromSeconds(3));
            }
        }
    }

    // Swagger 
    public static WebApplication UseAppPipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Swagger:Enabled"))
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        if (!app.Environment.IsProduction())
        {
            app.UseHttpsRedirection();
        }

        app.UseCors(CorsPolicy);
        app.UseAuthorization();
        return app;
    }
}