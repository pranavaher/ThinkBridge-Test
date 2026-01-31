using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace BuggyApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public InvoicesController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// List invoices (optionally filtered by customerName).
    /// GET /api/invoices
    /// GET /api/invoices?customerName=John%20Doe
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<InvoiceSummary>>> ListInvoices([FromQuery] string? customerName = null)
    {
        var connString =
            _configuration.GetConnectionString("TB")
            ?? throw new InvalidOperationException("Missing connection string: ConnectionStrings:TB");

        await using var conn = new NpgsqlConnection(connString);
        await conn.OpenAsync();

        var results = new List<InvoiceSummary>();

        await using var cmd = new NpgsqlCommand(
            """
            SELECT
              i.invoiceid,
              i.customername,
              COUNT(ii.itemid) AS itemcount,
              COALESCE(SUM(ii.price), 0) AS total
            FROM invoices i
            LEFT JOIN invoiceitems ii ON ii.invoiceid = i.invoiceid
            WHERE (@customerName IS NULL OR i.customername = @customerName)
            GROUP BY i.invoiceid, i.customername
            ORDER BY i.invoiceid
            """,
            conn);

        // Important: when customerName is NULL, Postgres can't infer parameter type
        // unless we explicitly set it (otherwise: "could not determine data type of parameter $1").
        cmd.Parameters.Add("customerName", NpgsqlTypes.NpgsqlDbType.Text).Value =
            (object?)customerName ?? DBNull.Value;

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new InvoiceSummary
            {
                InvoiceId = reader.GetInt32(0),
                CustomerName = reader.GetString(1),
                ItemCount = reader.GetInt64(2),
                Total = reader.GetDecimal(3)
            });
        }

        return Ok(results);
    }

    /// <summary>
    /// List distinct customers for filtering.
    /// GET /api/invoices/customers
    /// </summary>
    [HttpGet("customers")]
    public async Task<ActionResult<List<string>>> ListCustomers()
    {
        var connString =
            _configuration.GetConnectionString("TB")
            ?? throw new InvalidOperationException("Missing connection string: ConnectionStrings:TB");

        await using var conn = new NpgsqlConnection(connString);
        await conn.OpenAsync();

        var customers = new List<string>();

        await using var cmd = new NpgsqlCommand(
            """
            SELECT DISTINCT customername
            FROM invoices
            ORDER BY customername
            """,
            conn);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            customers.Add(reader.GetString(0));
        }

        return Ok(customers);
    }

    public sealed class InvoiceSummary
    {
        public int InvoiceId { get; set; }
        public string CustomerName { get; set; } = "";
        public long ItemCount { get; set; }
        public decimal Total { get; set; }
    }
}

