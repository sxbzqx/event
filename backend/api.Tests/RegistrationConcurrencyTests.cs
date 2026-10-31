using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.PostgreSql;
using Xunit;

namespace api.Tests;

public class RegistrationConcurrencyTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _pg = new PostgreSqlBuilder("postgres:16-alpine").Build();
    private WebApplicationFactory<Program> _factory = null!;

    public async Task InitializeAsync()
    {
        await _pg.StartAsync();
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", _pg.GetConnectionString());
        _factory = new WebApplicationFactory<Program>();
    }

    public async Task DisposeAsync()
    {
        await _factory.DisposeAsync();
        await _pg.DisposeAsync();
    }

    [Fact]
    public async Task FiftyConcurrentRegistrations_OnTenSeats_ExactlyTenSucceed()
    {
        var client = _factory.CreateClient();

        var create = await client.PostAsJsonAsync("/api/events", new
        {
            title = "Concurrency test",
            startTime = DateTime.UtcNow.AddDays(1),
            maxSeats = 10
        });
        create.EnsureSuccessStatusCode();
        var eventId = (await create.Content.ReadFromJsonAsync<CreatedDto>())!.Id;

        var gate = new TaskCompletionSource();
        var tasks = Enumerable.Range(0, 50).Select(i => Task.Run(async () =>
        {
            await gate.Task; // все стартуют одновременно
            var res = await client.PostAsJsonAsync($"/api/events/{eventId}/registrations",
                new { name = $"User {i}", email = $"user{i}@test.com" });
            return res.StatusCode;
        })).ToArray();

        gate.SetResult();
        var statuses = await Task.WhenAll(tasks);

        Assert.Equal(10, statuses.Count(s => s == HttpStatusCode.Created));
        Assert.Equal(40, statuses.Count(s => s == HttpStatusCode.Conflict));

        var ev = await client.GetFromJsonAsync<EventDto>($"/api/events/{eventId}");
        Assert.Equal(10, ev!.TakenSeats);
        Assert.Equal(0, ev.FreeSeats);
    }

    private record CreatedDto(int Id);
    private record EventDto(int TakenSeats, int FreeSeats);
}