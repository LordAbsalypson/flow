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
- **Backend/Database**: Firebase Firestore (Real-time NoSQL database).
- **AI Integration**: Google Gemini API (`@google/genai`).

### Data Flow & Real-Time Sync
1. **Session Management**: When the app loads, a unique `sessionId` is generated (or retrieved from `localStorage`). This session acts as the "room" that connects the presenter's screen to the participants' phones.
2. **Song Selection**: When the presenter selects a mood or searches for a song, the app calls the Gemini API to fetch song details (Title, Artist, YouTube Video ID, Lyrics, and Info).
3. **Database Update**: The app creates a new document in the Firestore `history` collection containing the song data and an empty map for `ratings` and `emojis`. It then updates the `sessions` document to point to this new `currentHistoryId`.
4. **Participant Voting**: When a participant scans the QR code, they are taken to `/vote/:sessionId`. The app listens to the `sessions` document to know which song is currently playing. When the participant votes, their rating and emoji are saved in the `history` document under their unique, locally-generated `userId`.
5. **Library Aggregation**: The Library screen queries the `history` collection for the current session, filters for songs that have received votes, and calculates the average rating.

### AI Prompts
The app uses the Gemini API to generate content tailored for a younger audience:
- **Song Info**: The prompt specifically asks for a fun fact or background about the band/song written in plain English that is easy for a 12-year-old to understand.
- **Lyrics Summary**: A secondary prompt takes the original lyrics and asks Gemini to write a short, concrete summary explaining the main gist and topic of the song, again tailored for a 12-year-old's comprehension level.

## Setup & Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Ensure your Firebase configuration is correctly set up in `src/firebase.ts`.
5. Run the development server:
   ```bash
   npm run dev
   ```

## Security & Privacy
- **Anonymous Voting**: No personally identifiable information (PII) is collected from participants. User IDs are randomly generated UUIDs stored only in the browser's `localStorage`.
- **Firestore Rules**: The database rules are configured to allow read/write access based on the `sessionId`, ensuring that data is isolated to the current session.
