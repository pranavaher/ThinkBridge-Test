# display_an_invoice

Minimal ASP.NET Core app that serves a small webpage at `/` and an API at `/api/invoice` which reads invoice data from local Postgres DB `TB`.

## Prereqs

- .NET SDK installed (`dotnet --version`)
- Postgres running locally, with database `TB` initialized using `database/init.sql`

## Configure DB connection

Update `backend/appsettings.Development.json` (or `backend/appsettings.json`) with your Postgres credentials.

If you're committing to GitHub, keep secrets out of the repo:

- copy `backend/appsettings.Development.json.example` → `backend/appsettings.Development.json`
- then edit the password locally

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

- `http://localhost:5000/` (invoice page)
- `http://localhost:5000/api/invoice` (invoice JSON)

