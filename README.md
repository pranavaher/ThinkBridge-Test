# display_an_invoice

Minimal ASP.NET Core app that serves a small webpage at `/` and an API at `/api/invoice` which reads invoice data from local Postgres DB `TB`.

## Prereqs

- .NET SDK installed (`dotnet --version`)
- Postgres running locally, with database `TB` initialized using `database/init.sql`

## Configure DB connection

This repo is meant to be pushed to GitHub, so **do not commit real credentials**.

1) Copy the example config:

- `backend/appsettings.Development.json.example` → `backend/appsettings.Development.json`

2) Edit `backend/appsettings.Development.json` locally and set your Postgres connection string:

Host=localhost;Port=5432;Database=TB;Username=<YOUR_USER>;Password=<YOUR_PASSWORD>


```text
Host=localhost;Port=5432;Database=TB;Username=postgres;Password=postgres
```

## Run

From the backend folder:

```bash
cd backend
dotnet restore
dotnet run
```

Then open:

- `http://localhost:5000/` — **Invoice page** (supports `/?invoiceId=2`)
- `http://localhost:5000/invoices.html` — **All invoices page** (supports filtering: `?customerName=Alice%20Smith`)
- `http://localhost:5000/api/invoice` — **Invoice details JSON** (supports `?invoiceId=2`)
- `http://localhost:5000/api/invoices` — **Invoice summaries JSON** (supports `?customerName=Alice%20Smith`)
- `http://localhost:5000/api/invoices/customers` — **Distinct customer list JSON**
- `http://localhost:5000/swagger` — **Swagger UI (API docs)**
- `http://localhost:5000/swagger/v1/swagger.json` — **OpenAPI JSON**

