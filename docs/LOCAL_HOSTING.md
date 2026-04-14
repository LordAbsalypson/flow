# Local Hosting Guide

Welcome! This guide explains how to host A-Flow **completely locally** on a single computer without needing any internet connection for the database. Very helpful for running the application securely in Day Care Centers under local network governance.

## 1. How the App Works Without the Cloud

Normally, A-Flow requires an internet connection to connect to "Firebase" (Google's Cloud database) to sync the song playing and the ratings taking place on smartphones. 

In this "Localhost Version", we have removed Firebase entirely. Instead, the A-Flow host computer creates its **own independent database** file right on the hard drive (`local_database.sqlite`). 

Because it's locally hosted, here is what happens:
- The **Social Worker (Host)** connects via the main PC browser (usually displayed on a TV or big screen).
- The **Clients (Voters)** connect using their iPhones or Android devices.
- As long as both the Host PC and the smartphones are connected to the **exact same Wi-Fi network**, they can seamlessly talk to each other without sending data over the internet!
- Every time you start the app, all previous History, Ratings, and Songs are securely restored from your hard drive exactly how you left off. 

---

## 2. Setting it up the first time

This assumes someone has already installed the Node.js requirement on the hosting PC. Open a terminal / command prompt.

First, download all required local components once by typing:
> `npm install`

---

## 3. Starting the Local Application

It's super simple! To start both the Website and your Local Database, run just **one** command:

> `npm run dev`

This will automatically:
1. Start the backend saving system (on Port 3001).
2. Start the Website (on Port 3000).

When you see the green text saying `Local Backend running on port 3001` and `Vite ready in X ms`, you are good to go!

---

## 4. How to join the session

### On the Host PC (TV/Monitor)
Open the browser and enter: `http://localhost:3000/`

You can start selecting a song. Once a song plays, a **QR Code** will be visible on the screen.

### On the Smartphones (Clients)
To make rating work:
1. Ensure the smartphone is connected to the **same Wi-Fi** as the Host PC.
2. Open the camera app on the smartphone and scan the QR code displayed on the screen.
3. The phone will open a link that looks like `http://192.168...:3000/vote/SESSION_ID`. 
4. The rating view appears, and votes are pushed **instantly** to the big screen. No internet data required! 

## 5. Shutting down
To close the software, simply select the terminal window and press **Ctrl + C**. The `local_database.sqlite` file is safely stored, and your state will continue to work normally next time you boot up.
