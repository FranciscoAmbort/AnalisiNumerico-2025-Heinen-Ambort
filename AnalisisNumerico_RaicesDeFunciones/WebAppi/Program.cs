using AnalisisNumerico_RaicesDeFunciones;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Registramos directamente la clase concreta
builder.Services.AddScoped<MetodosCerrados>();
builder.Services.AddScoped<MetodosAbiertos>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS para desarrollo
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DevCors");
app.UseHttpsRedirection();
app.UseStaticFiles();
app.MapControllers();
app.Run();

