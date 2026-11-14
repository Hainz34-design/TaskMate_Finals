# TaskMate backend

The Expo app sends authentication requests to this API. The API connects to
MongoDB using `Database/.env`; the MongoDB URI must never be placed in the app.

## Run locally

1. Keep the existing MongoDB URI in `Database/.env`.
2. Set `JWT_SECRET` there to a random secret of at least 32 characters.
3. From the repository root, run `npm install` and then `npm run backend`.
4. In another terminal, run `npx expo start`.

The API listens on port `5000`. `GET /health` reports whether MongoDB is
connected. Authentication endpoints are:

- `POST /api/auth/register` with `{ "fullName", "email", "password" }`
- `POST /api/auth/login` with `{ "email", "password" }`

New users are saved in the MongoDB `users` collection with a password hash.
Each successful login is recorded in `loginevents`; passwords are never saved
in that collection.

The root `.env.local` contains the public API URL used by Expo. For a physical
phone, replace `localhost` with the computer's LAN IP address while both
devices are on the same network. The public URL is not a secret; the MongoDB
URI and JWT secret are.
