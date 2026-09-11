# Places deployment guide

This document describes the V0.1 deployment path for personal testing on an iPhone with Expo Go.

## Target architecture

```text
iPhone / Expo Go
      |
      | HTTPS
      v
Railway backend
Node.js + Express
      |
      v
MongoDB
```

The mobile app itself does not need to be deployed to the App Store during V0.1. Expo Go can run it directly while the API remains publicly reachable on Railway.

## Railway backend

Create a dedicated Railway service from the `since56k/Places` repository.

Recommended service settings:

```text
Branch: main
Root directory: /backend
Config file: railway.toml
Healthcheck: /health
Start command: npm start
```

The repository contains `backend/railway.toml`, so the deploy settings remain version controlled.

## Required backend variables

```text
MONGO_URI=<mongodb connection string>
PORT=3000
```

Railway can provide `PORT` automatically. The server already reads `process.env.PORT`, so a manually fixed port is not required in production.

Never commit a real MongoDB connection string to GitHub. Keep it in Railway variables or a local `.env` file.

## MongoDB

For V0.1, the backend only requires a valid MongoDB connection string. The database can be hosted separately or attached to the Railway project.

The database stores three main collections:

```text
places
savedplaces
lists
```

Shared Place data is separated from the test user's saved metadata so the schema can support multiple users later.

## Public API domain

Once the Railway backend is healthy, expose it with a Railway-generated domain such as:

```text
https://places-api-production.up.railway.app
```

Verify the deployment by opening:

```text
https://<railway-domain>/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "places-api"
}
```

## Connect Expo to Railway

Create `mobile/.env` from the example and point it to the Railway API:

```text
EXPO_PUBLIC_API_URL=https://<railway-domain>
```

Then restart Expo so the environment variable is reloaded:

```bash
cd mobile
npm start
```

When `EXPO_PUBLIC_API_URL` is present, Places loads and persists data through the backend. When it is absent, the V0.1 app falls back to demo data for UI development.

## Deployment checklist

1. Deploy the `backend` directory from `since56k/Places`.
2. Configure `MONGO_URI` in Railway.
3. Confirm `/health` returns HTTP 200.
4. Generate a Railway public domain.
5. Put that domain in `mobile/.env` as `EXPO_PUBLIC_API_URL`.
6. Restart Expo Go.
7. Add a test place and confirm it still exists after restarting the app.
8. Test Visited / Want to go, rating, price, notes, tags and custom lists.

## Existing infrastructure

Do not overwrite unrelated or legacy Railway services when testing Places. Use a dedicated Places service so the V0.1 backend can evolve independently and can be removed safely if needed.
