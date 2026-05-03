# 🎮 Play Together (العب معايا)

Real-time multiplayer games web app built with React + Firebase Realtime Database.

## 🎯 Features

- **3 Games:**
  - 🎨 Draw & Guess (ارسم وخمّن) - Draw and let others guess!
  - 🤐 Forbidden Word (الكلمة المحظورة) - Describe without forbidden words!
  - 🤔 Who Is It? (مين ده؟) - Ask questions to guess the character!

- **2-5 Players** per room
- **Bilingual** - Arabic (RTL) + English (LTR)
- **Dark Romantic Theme** - Midnight background with coral/amber accents
- **Mobile-first** responsive design (375px+)
- **Real-time** sync via Firebase Realtime Database

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
cd play-together
npm install
```

### 2. Configure Firebase

⚠️ **IMPORTANT:** Open `src/config.jsx` and replace the placeholder values with your actual Firebase config:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `shehab-9687f`
3. Go to **Project Settings** (⚙️ gear icon) → **General** → **Your apps**
4. If no web app exists, click **Add app** (Web/</> icon)
5. Copy the `firebaseConfig` object and replace the values in `src/config.jsx`

Your config should look like this:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "shehab-9687f.firebaseapp.com",
  databaseURL: "https://shehab-9687f-default-rtdb.firebaseio.com",
  projectId: "shehab-9687f",
  storageBucket: "shehab-9687f.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

### 3. Configure Database Rules

In Firebase Console, go to **Realtime Database** → **Rules** and set:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        ".indexOn": ["createdAt"]
      }
    }
  }
}
```

> ⚠️ Note: These rules allow anyone to read/write. For production, use proper authentication rules.

### 4. Run the App

```bash
npm start
```

The app will open at `http://localhost:3000`

## 📁 File Structure

```
src/
├── config.jsx              ← Firebase initialization + DB export
├── App.jsx                 ← Main component: state, Firebase, navigation
├── index.js                ← Entry point
├── index.css               ← Global styles + animations
├── data.js                 ← Word banks, characters, questions (EN + AR)
├── i18n/
│   └── translations.js     ← All UI strings + t() helper
└── components/
    ├── Lobby.jsx           ← Home, Lobby, GameSelect screens
    ├── SharedUI.jsx        ← Shared: PlayerList, ScoreBoard, Timer, Chat, etc.
    ├── DrawGuess.jsx       ← Draw & Guess game (separate file)
    ├── ForbiddenWord.jsx   ← Forbidden Word game (separate file)
    └── WhoIsIt.jsx         ← Who Is It? game (separate file)
```

## 🎮 How to Play

### Draw & Guess
1. One player is selected as the drawer
2. The drawer sees a word and draws it on the canvas
3. Other players type guesses in the chat
4. Correct guesses earn points for both guesser and drawer
5. 60 seconds per round

### Forbidden Word
1. One player is the describer
2. They see a word and a list of forbidden words
3. They must describe the word WITHOUT saying any forbidden word
4. Other players guess in chat
5. Using a forbidden word = -5 points penalty
6. 45 seconds per round

### Who Is It?
1. A character is chosen (with category hint)
2. Hints are revealed progressively
3. Players ask yes/no questions and make guesses
4. First correct guess gets bonus points
5. 90 seconds per round

## 🌐 Deploy

```bash
npm run build
```

Upload the `build/` folder to any hosting service (Firebase Hosting, Netlify, Vercel, etc.)

## 🔧 Tech Stack

- **React 18** - UI framework
- **Firebase Realtime Database** - Real-time multiplayer sync
- **Create React App** - Build tool
- **Pure CSS** - Styling (no external CSS framework)
