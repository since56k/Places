# Places

Places is a mobile-first personal place discovery and curation app.

The first release is intentionally designed for single-user testing. The goal is to validate the core experience before adding the public social layer.

## Product concept

Places separates discovery from personal organization:

- **Feed**: visual discovery feed inspired by image-first social apps, using a masonry-style two-column layout.
- **Explore**: search and filter places.
- **Add**: add and publish a place.
- **My Places**: personal square-card library of saved places.
- **Profile**: personal profile and activity.

## V0.1 scope

### Feed
- Image-first cards
- Place name and short caption
- Save action
- Open place details

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
├── docs/         Product and architecture documentation
└── README.md
```

The mobile app communicates with the backend through a JSON REST API. The backend is designed to run on Railway. During V0.1 the app uses a single pre-approved test user.

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

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to the backend URL.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `MONGO_URI` and other required values in `backend/.env`.

## Data model

A `Place` stores shared place information such as name, type, city, country, image and description.

A `SavedPlace` stores the user's relationship with that place: status, rating, price, note, tags and lists. Keeping these separate prepares the product for multiple users later without redesigning the place model.

## Deployment strategy

V0.1:
- Mobile: Expo / Expo Go for personal testing
- API: Railway
- Database: MongoDB
- Admin: not deployed yet

Later releases can move to development builds/TestFlight and add the public social layer.

## Status

Early V0.1 scaffold. The priority is a usable personal test build, not production completeness.
