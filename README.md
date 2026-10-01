# Sensor Monitor Web

A small Next.js (App Router, TypeScript) frontend for the
[SensorMonitor](https://github.com/thorstore-ong/sensor-monitor-microservice/tree/main/SensorMonitor) API.

## Run it

1. Start the API so it listens on https://localhost:5001 (the default this app expects).
2. In this folder:

```bash
npm install
cp .env.example .env.local   # only needed if the API isn't on https://localhost:5001
npm run dev
```

Open http://localhost:3000.

## How it talks to the API

The API has no CORS policy, so the browser calls `/proxy/*` on Next.js, and the route in
`app/proxy/[...path]/route.ts` forwards it to `SENSOR_API_URL` from the server. No API changes are needed.
In development the proxy accepts the self-signed .NET dev certificate for a `localhost` API; that is
never applied in production builds or to other hosts.

| View        | API call                       |
| ----------- | ------------------------------ |
| Readings    | `GET /sensors`                 |
| Batteries   | `GET /sensors/batteries`       |
| Generators  | `GET /sensors/generators`      |
| Rectifiers  | `GET /sensors/rectifiers`      |
| Send data   | `POST /api/Temeletry`          |

The POST route is `/api/Temeletry` because the controller class is spelled `TemeletryController`.
If you rename it, update `POST_PATH` in `lib/api.ts`.

## Status thresholds

Set in `components/SensorPanels.tsx`: battery low below 30% and critical below 15%;
generator fuel low below 25% and critical below 10%; rectifier warns when the grid is off.
