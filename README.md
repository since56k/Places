# Places

Places is a mobile-first personal place discovery and curation app.

The first release is intentionally designed for single-user testing. The goal is to validate the core experience before adding the public social layer.

## Product concept

Places separates discovery from personal organization:

- **Feed**: visual discovery feed inspired by image-first social apps, using a two-column layout.
- **Explore**: search and filter places.
- **Add**: add and publish a place.
- **My Places**: personal square-card library of saved places.
- **Profile**: personal profile and activity.

## V0.1 scope

### Feed
- Image-first cards
- Place name and short caption
- Save action
- Open Place Details

### My Places
- Square 1:1 cards
- Search
- Filters: type, country, city, status, price, rating and tags
- Status: `visited` or `want_to_go`
- Personal rating
- Price level: 1-4
- Personal notes
- Custom tags
- Custom lists
- A place can belong to multiple lists

### Custom lists
Examples: Tokyo, Date Night, Tuscany, Wine Bars, Restaurants to Try.

### Not in V0.1
Public signup, followers, comments, chat, push notifications, advanced recommendations, embedded maps and a complete admin dashboard are intentionally deferred.

## Architecture

```text
Places/
├── mobile/       React Native + Expo
├── backend/      Node.js + Express + MongoDB
├── admin/        Reserved for future React web admin
├── docs/         Product and deployment documentation
└── README.md
```

The mobile app communicates with the backend through a JSON REST API. The backend is designed to run on Railway. During V0.1 the app uses a single `test-user` identity while keeping personal state separate from shared Place data.

## Development

### Requirements
- Node.js 20+
- npm
- Expo Go on the test iPhone
- MongoDB

### Mobile

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to the backend URL. For testing on a physical iPhone, use the public Railway URL rather than localhost.

If `EXPO_PUBLIC_API_URL` is not configured, the app remains usable in local demo mode with in-memory data. This is intentional so UI development is not blocked by backend setup.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `MONGO_URI` in `backend/.env`.

Available V0.1 endpoints:

```text
GET    /health
GET    /api/places
POST   /api/places
GET    /api/places/:id
PATCH  /api/places/:id
DELETE /api/places/:id

GET    /api/lists
POST   /api/lists
DELETE /api/lists/:id

GET    /api/saved-places
PUT    /api/saved-places/:placeId
DELETE /api/saved-places/:placeId
```

## Data model

A `Place` stores shared information such as name, type, city, country, image, caption and description.

A `SavedPlace` stores the user's relationship with that place: status, rating, price, note, tags and lists. This separation allows multiple users to save the same shared Place differently later.

A `List` stores user-created collections. The same place can belong to multiple lists.

## Persistence flow

When the API is configured:

```text
Expo app
   │
   ├── Add Place ───────► POST /api/places
   │                           │
   │                           ▼
   │                    MongoDB Place
   │
   └── Personal state ──► PUT /api/saved-places/:placeId
                               │
                               ├── status
                               ├── rating / price
                               ├── note / tags
                               └── custom lists
```

`My Places` is built from saved-place records, while the Feed can also contain shared places that have not yet been saved personally.

## Deployment strategy

V0.1:
- Mobile: Expo / Expo Go for personal testing
- API: Railway
- Database: MongoDB
- Admin: not deployed yet

The backend now includes `backend/railway.toml` with the Nixpacks build, `npm start`, `/health` healthcheck and restart policy required for the Railway service.

Full setup and verification instructions are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

Later releases can move to development builds/TestFlight and add the public social layer.

## Status

V0.1 currently includes the mobile navigation shell, image-first Feed, Place Details, Add Place flow, My Places library, Visited/Want to go, rating, price, notes, tags, custom lists, backend persistence APIs and version-controlled Railway deployment configuration.

The next operational step is creating a dedicated Places Railway service, connecting MongoDB and setting its public URL in `EXPO_PUBLIC_API_URL`.
