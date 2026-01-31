using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace BuggyApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public InvoiceController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Keep the frontend contract: GET /api/invoice
    // Defaults to invoiceId=1 (matches init.sql seed).
    [HttpGet]
    public async Task<ActionResult<InvoiceResponse>> GetInvoice([FromQuery] int invoiceId = 1)
    {
        var connString =
            _configuration.GetConnectionString("TB")
            ?? throw new InvalidOperationException("Missing connection string: ConnectionStrings:TB");

        await using var conn = new NpgsqlConnection(connString);
        await conn.OpenAsync();

        string? customerName = null;
        await using (var cmd = new NpgsqlCommand(
                         """
                         SELECT customername
                         FROM invoices
                         WHERE invoiceid = @invoiceId
                         """,
                         conn))
        {
            cmd.Parameters.AddWithValue("invoiceId", invoiceId);
            var scalar = await cmd.ExecuteScalarAsync();
            customerName = scalar as string;
        }

        if (string.IsNullOrWhiteSpace(customerName))
        {
            return NotFound(new { message = $"Invoice {invoiceId} not found" });
        }

        var items = new List<Item>();
        await using (var cmd = new NpgsqlCommand(
                         """
                         SELECT name, price
                         FROM invoiceitems
                         WHERE invoiceid = @invoiceId
                         ORDER BY itemid
                         """,
                         conn))
        {
            cmd.Parameters.AddWithValue("invoiceId", invoiceId);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                items.Add(new Item
                {
                    Name = reader.GetString(0),
                    Price = reader.GetDecimal(1)
                });
            }
        }

        return Ok(new InvoiceResponse
        {
            InvoiceId = invoiceId,
            CustomerName = customerName,
            Items = items
        });
    }

    public sealed class InvoiceResponse
    {
        public int InvoiceId { get; set; }
        public string CustomerName { get; set; } = "";
        public List<Item> Items { get; set; } = new();
    }

    public sealed class Item
    {
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
    }
}

