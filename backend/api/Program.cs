using api.Exceptions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAppCors(builder.Configuration)
    .AddAppDatabase(builder.Configuration)
    .AddAppServices();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.ApplyMigrations();
app.UseAppPipeline();
app.MapControllers();

app.Run();

public partial class Program { }