# Flow - Collaborative Music Discovery & Rating App

Flow is an interactive, real-time music discovery and rating application designed for group settings (like classrooms, parties, or workshops). It allows a presenter to play music based on moods or specific searches, while up to 40+ participants can simultaneously rate the songs and react with emojis using their mobile devices—without needing to log in or create an account.

## Features

### 1. Presenter Screen (Desktop/Tablet)
- **Mood Selection**: Choose from predefined moods (Calm, Happy, Sad, Angry, Energetic, Relaxing) to get an AI-curated song recommendation.
- **Search**: Search for specific songs or artists.
- **Music Player**: Plays the selected song via an embedded YouTube player.
- **Song Info & Lyrics**: Displays a fun, easy-to-understand fact about the song/artist, along with a simplified summary of the lyrics (designed to be easily understood by a 12-year-old). Users can toggle between the summary and the original lyrics.
- **Omnipresent QR Code**: A QR code is always visible on the player screen. Participants can scan this code to join the session instantly.
- **Library**: View the history of the last 5 rated songs, including their average rating out of 5.

### 2. Participant Screen (Mobile)
- **No Login Required**: Participants scan the QR code and are instantly taken to the voting page. A unique, anonymous User ID is generated and stored locally on their device.
- **Real-Time Voting**: Participants can rate the currently playing song from 1 to 5.
- **Emoji Reactions**: Participants can select an emoji that represents how the song makes them feel.
- **Live Sync**: The voting screen automatically updates when the presenter skips to the next song.

## How It Works (Technical Overview)

### Architecture
- **Frontend**: React (Vite), Tailwind CSS, React Router.
- **Backend/Database**: Node.js Express Server with **SQLite** (`better-sqlite3`) and **Socket.IO** for real-time WebSocket sync.
- **AI Integration**: Google Gemini API (`@google/genai`).
- **AI Integration**: Google Gemini API (`@google/genai`).

### Data Flow & Real-Time Sync
1. **Session Management**: When the app loads, a unique `sessionId` is generated (or retrieved from `localStorage`). This session acts as the "room" that connects the presenter's screen to the participants' phones.
2. **Song Selection**: When the presenter selects a mood or searches for a song, the app calls the Gemini API to fetch song details (Title, Artist, YouTube Video ID, Lyrics, and Info).
3. **Database Update**: The app creates a new SQLite row in the `history` table containing the song data and empty JSON maps for `ratings` and `emojis`. It then updates the `sessions` table to point to this new `currentHistoryId` and emits a WebSocket event via Socket.IO.
4. **Participant Voting**: When a participant scans the QR code, they are taken to `/vote/:sessionId`. The app listens to Socket.IO events to know which song is currently playing. When the participant votes, an API request triggers an update in the SQLite database, and the changes are broadcast back to the screen instantly.
5. **Library Aggregation**: The Library screen queries the SQLite database for the current session, filtering for songs that have received votes.

### AI Prompts
The app uses the Gemini API to generate content specifically tailored for users with cognitive disabilities (e.g., Down syndrome) who benefit from "Easy Read" formatting. The prompts are designed to accommodate limited working memory, literal thinking, and an early primary school reading level.

**Song Info Master Prompt:**
> "A short, concrete fact about the song or band. Use very simple, everyday words. Use short, clear sentences. Do not use metaphors, idioms, or hard words. Write at an early primary school reading level. (max 2 sentences)."

**Lyrics Summary Master Prompt:**
> "Write a short summary explaining what this song is about. You MUST follow these rules for the reader:
> - Use very simple, everyday words and high-frequency vocabulary.
> - Use short, clear sentences.
> - Write at an early primary school reading level ("Easy Read" format).
> - Translate any abstract lyrics or metaphors into literal, concrete concepts.
> - Do NOT use idioms, complex sentences, or abstract content."

## Setup & Installation (Local Host Version)

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the application:
   ```bash
   npm run dev
   ```
5. **How to access (CRITICAL)**:
   - Do **NOT** use `http://localhost:3000` if you want participants to scan the QR code.
   - Look for the **Network IP** in the terminal (e.g., `http://192.168.1.50:3000`).
   - Use that IP address on your Host PC browser.
   - This ensures the QR code generated points to the correct network address reachable by mobile devices.

*For highly detailed instructions oriented for Social Workers, please read [LOCAL_HOSTING.md](./docs/LOCAL_HOSTING.md).*

## Security & Privacy
- **Anonymous Voting**: No personally identifiable information (PII) is collected from participants. User IDs are randomly generated UUIDs stored only in the browser's `localStorage`.
- **Complete Local Governance**: Data never leaves the host computer. The internal SQLite database (`local_database.sqlite`) holds all info locally, and **Firebase has been removed entirely** for this version.
