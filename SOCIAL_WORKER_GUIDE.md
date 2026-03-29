# Social Worker Guide for Flow App

Welcome to **Flow**, a music and ranking app designed for daycare centers. This guide will help you set up and use the app on your local machine.

## 1. What is this app?
Flow allows clients (e.g., people with Down syndrome or autism) to listen to music and express their feelings or ratings.
- One machine acts as the **"Player"** (the screen that shows the music).
- Clients use their own devices (tablets or phones) to **"Rate"** the music.

## 2. How to Start the App
To run this app on your local computer, follow these steps:
1.  **Open the app folder.**
2.  **Start the server:** Open a terminal (command prompt) in this folder and type:
    ```bash
    npm run local
    ```
3.  **Open the Player:** Open your web browser and go to the address shown in the terminal (for example, `http://192.168.1.50:3001`). 
    - **Note:** Do NOT use `localhost:3001` if you want other devices to connect! Use the longer address with numbers.
4.  **Connect Clients:** On the "Player" screen, there is a **QR Code**. Ask clients to scan this with their phone or tablet. This will take them to the rating page.

## 3. Data Security & Privacy (GDPR)
This version of the app is **self-hosted**, meaning all data is stored on **your machine**.
- **No Names:** We do not ask for names or emails. Everything is saved with a random unique ID (UUID).
- **Cookies:** The app uses "Local Storage" on the client's device to remember their unique ID. This is necessary for the app to work.
- **Agreement:** By using the app, the client agrees to this simple data storage. You should explain to the client that their rating is saved anonymously to help improve the daycare experience.
- **Data Flow:** 
  - **Rankings/Votes:** Stay on your computer in the `db.json` file.
  - **Music AI:** To find songs and simplify lyrics, the app sends search requests to Google's Gemini AI. No personal names are sent to Google, only the song categories (e.g., "Happy", "Calm").
- **Local Network:** The data does not go to the cloud (except for the AI that finds the songs). The ratings stay in your `db.json` file.

## 4. Troubleshooting
- **Cannot scan QR Code:** Make sure the client's device is on the same Wi-Fi as your computer.
- **No music:** Ensure you have an internet connection, as the app needs to find songs from YouTube and Gemini AI.
- **Resetting everything:** If you want to delete all ratings, simply delete the `db.json` file in the folder.

## 5. Contact
If you have questions, please reach out to your technical support.
