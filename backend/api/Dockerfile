# ---------- build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Отдельный слой для restore — кешируется, пока не менялся csproj
COPY api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish api.csproj -c Release -o /app/publish --no-restore

# ---------- runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_EnableDiagnostics=0

COPY --from=build /app/publish ./

# Непривилегированный пользователь (UID задан в базовом образе)
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "api.dll"]
