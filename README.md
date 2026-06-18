# MeetScribe 🎙️

> AI-powered meeting assistant for Google Meet — transcribe, summarize, and analyze your meetings automatically.

MeetScribe is a full-stack application consisting of a **Chrome extension** that captures Google Meet transcripts in real time, a **Node.js/Express backend** that processes them with Gemini AI, and a **Next.js frontend** where users can review summaries, track action items, and explore an analytics dashboard.

---

## Features

- 🎤 **Live transcription** — captures speech from Google Meet via Chrome extension
- 🤖 **AI summarization** — Gemini AI generates clean summaries, strips filler words, and deduplicates repeated phrases
- ✅ **Action item extraction** — automatically identifies tasks and owners from the transcript
- 👥 **Participant detection** — extracts participant names mentioned in the conversation
- 😊 **Sentiment analysis** — classifies meeting tone as positive, neutral, or negative with a score and insight
- 🏷️ **Auto-tagging** — generates smart tags like `sprint-planning`, `design`, `urgent` from the summary
- 📅 **Next meeting detection** — extracts any mentioned follow-up date or time
- 📊 **Analytics dashboard** — tracks meeting duration, participant activity, sentiment trends, and tag-based filtering
- 📤 **Markdown export** — download any meeting as a formatted `.md` file
- 🔐 **Auth** — email/password signup + Google OAuth via NextAuth

---

## Tech Stack

| Layer | Tech |
|---|---|
| Chrome Extension | Vanilla JS (`content.js`, `background.js`, `popup.js`) |
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini API |
| Auth | JWT + NextAuth (Google OAuth) |

---

## Project Structure

```
meetscribe/
├── extension/              # Chrome extension
│   ├── content.js          # Injects into Google Meet, captures transcript
│   ├── background.js       # Service worker, auth bridge
│   ├── popup.js            # Extension popup UI
│   ├── authBridge.js       # Syncs auth token between extension and web app
│   ├── authSync.js
│   └── manifest.json
│
├── backend/                # Express API
│   ├── models/
│   │   ├── SummaryModel.js # Meeting schema (transcript, summary, sentiment, tags, participants...)
│   │   └── UserModel.js
│   ├── routers/
│   │   ├── aiRouter.js     # /summarize, /action-items, /sentiment, /auto-tag, /ask, /export
│   │   ├── SumRouter.js
│   │   └── UserRouter.js   # /register, /authenticate, /google-login, /me, /history
│   ├── gemini.js           # Gemini AI wrapper
│   ├── connection.js       # MongoDB connection
│   └── index.js
│
└── frontend/               # Next.js app
    └── src/app/
        ├── components/
        │   ├── NavBar.jsx       # Responsive nav, shows Dashboard + History only when logged in
        │   └── SessionWrapper.jsx
        ├── dashboard/
        │   └── page.jsx         # Analytics dashboard (auth-protected, client-side guard)
        ├── history/
        │   └── page.jsx
        ├── login/
        ├── signup/
        └── contactus/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key
- Google OAuth credentials (for NextAuth)

### 1. Clone the repo

```bash
git clone https://github.com/lavanya28007/meetscribe.git
cd meetscribe
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

```bash
node index.js
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

```bash
npm run dev
```

### 4. Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension/` folder
4. Open Google Meet — MeetScribe will activate automatically

---

## API Reference

All AI routes are under `/ai`, user routes under `/user`.

### AI Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/summarize` | Summarize a transcript, extract participants + next meeting |
| `POST` | `/ai/action-items` | Extract action items from a transcript |
| `POST` | `/ai/sentiment` | Analyze meeting sentiment (label, score, insight) |
| `POST` | `/ai/auto-tag` | Generate smart tags from a summary |
| `POST` | `/ai/ask` | Ask a question about a specific meeting |
| `PATCH` | `/ai/tag/:summaryId` | Manually add/remove tags, star, or archive a meeting |
| `GET` | `/ai/export/:summaryId` | Download meeting as Markdown |

### User Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/user/register` | — | Register with email/password |
| `POST` | `/user/authenticate` | — | Login, returns JWT |
| `POST` | `/user/google-login` | — | Google OAuth login |
| `GET` | `/user/me` | ✅ | Get current user profile |
| `GET` | `/user/history` | ✅ | Get all meetings for the logged-in user |
| `DELETE` | `/user/history/:id` | ✅ | Delete a meeting |

---

## Data Model

Each meeting (`Summary`) stores:

```js
{
  meetingTitle: String,
  transcript: String,
  summary: String,
  userId: ObjectId,          // ref: users
  actionItems: [String],
  participants: [String],    // auto-extracted from transcript
  sentiment: {
    label: "positive" | "neutral" | "negative",
    score: Number,           // -1.0 to 1.0
    insight: String,
    breakdown: [{ section, tone }]
  },
  tags: [String],            // auto-generated or manually added
  starred: Boolean,
  archived: Boolean,
  duration: Number,          // minutes
  nextMeeting: String,
  exportedAt: Date,
  createdAt: Date
}
```

---

## Analytics Dashboard

The dashboard (`/dashboard`) is protected — only accessible to logged-in users. It shows:

- Total meetings, average duration, average participants, positive sentiment %
- Sentiment breakdown bar (positive / neutral / negative)
- Top participants ranked by meeting frequency
- Filterable meetings table (by time range, sentiment, title search)
- Click-through drawer with full meeting details

Auth is handled client-side: the page reads the JWT from `localStorage` on mount and redirects to `/login` if no valid session is found.

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)
