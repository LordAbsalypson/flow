# Flow - Localhost Version

This branch contains the self-hosted version of Flow. It replaces Firebase with a local Express server and `lowdb` (JSON file).

## Quick Start
1.  **Clone this branch:** `git checkout localhost`
2.  **Install dependencies:** `npm install`
3.  **Setup .env:** Create a `.env` file and add:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
4.  **Run the app:**
    ```bash
    npm run local
    ```
    This will build the frontend and start the Express server on port 3001.

## Development
- Frontend (Vite): `npm run dev` (port 3000)
- Backend (Express): `tsx server/index.ts` (port 3001)
- Run both: `npm run local:dev`

## Key Differences from Firebase version
- **Database:** Uses `db.json` on disk instead of Firestore.
- **Real-time:** Uses `socket.io` instead of Firestore Snapshots.
- **QR Code:** Points to the local machine's network IP address.
- **Privacy:** All data is local, making it ideal for offline use or strict privacy requirements.

## Troubleshooting
If you see "Waiting for a song to play..." on the rating page, make sure the Player is running and has selected a song.
Check the terminal for the exact network IP address.
