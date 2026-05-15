# PRD — Rural STEM Learning Platform (Hackathon, 6hr)

## Overview
A gamified web platform for grades 6–12 in rural schools. Core scope: quizzes, study/reading material, Google Translate integration, offline material download, Firebase auth + Firestore. Runs inside Docker.

---

## Scope (What We're Building)

| Feature | In Scope |
|---|---|
| Firebase Auth (email/password) | ✅ |
| Study Material (reading/guides) | ✅ |
| Quizzes (MCQ) | ✅ |
| Multilingual via Google Translate Widget | ✅ |
| Download material as PDF (offline read) | ✅ |
| Gamification (score/XP) | ✅ |
| Teacher dashboard | ❌ |
| PWA / true offline | ❌ |

---

## UI/UX
> See `design.md` — implement exactly as specified there.
> General tone: bright, friendly, mobile-first, low-bandwidth safe.

---

## Tech Stack

```
Framework : Next.js (App Router)
Styling   : Tailwind CSS
Auth/DB   : Firebase Auth + Firestore
Translate : Google Translate Widget (injected in _document / layout)
PDF       : window.print() or jsPDF for download
Container : Docker (dev environment only)
```

---

## Docker Setup

Simple dev container — no nginx, no multi-stage.

```
/
├── Dockerfile
├── docker-compose.yml
└── app/   ← Next.js project
```

**Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY app/ .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

**docker-compose.yml** — mounts `./app` as volume so hot reload works, port `3000:3000`.  
Firebase config via `.env.local` (not committed).

---

## Firebase Structure

### Auth
Email/password. On signup collect: `name`, `grade` (6–12).  
No language preference stored — translation handled client-side by Google.

### Firestore Collections

```
users/{uid}
  name        : string
  grade       : number
  xp          : number
  quizzesDone : string[]

subjects/{subjectId}
  name        : string
  grade       : number
  icon        : string

studyMaterial/{materialId}
  subjectId   : string
  title       : string
  content     : string    // markdown
  grade       : number
  order       : number

quizzes/{quizId}
  subjectId   : string
  title       : string
  grade       : number
  xpReward    : number
  questions   : [
    {
      q       : string
      options : string[]  // 4 items
      answer  : number    // index 0–3
    }
  ]

quizResults/{resultId}
  uid         : string
  quizId      : string
  score       : number
  total       : number
  completedAt : timestamp
```

> Content is stored in English only. Google Translate handles rendering in the user's language.

---

## App Pages / Routes

```
/login              → Login / Signup
/                   → Home (subject cards filtered by user grade)
/subject/[id]       → Subject page (material list + quiz list)
/material/[id]      → Reading view (markdown rendered) + Download button
/quiz/[id]          → Quiz (MCQ, one question at a time)
/quiz/[id]/result   → Score + XP earned
/profile            → XP total, completed quizzes
```

---

## Multilingual

- Inject **Google Translate Widget** in `app/layout.tsx` (script + `google_translate_element` div in navbar)
- Zero content duplication in Firestore — all content stays in English
- Widget auto-translates entire page DOM including dynamic Firestore content
- Language selector floats in navbar

---

## Offline / Download

- On `/material/[id]` page, a **Download** button triggers `window.print()` with a print-specific CSS that hides nav/buttons and renders clean readable content
- Browser saves as PDF natively — no extra library needed
- Keep it simple; no service worker

---

## Gamification (Minimal)

- Each quiz has `xpReward` (e.g. 10 XP)
- On quiz complete → `users/{uid}.xp += xpReward`, push quizId to `quizzesDone`
- Profile shows XP + quiz count
- Simple star/badge shown on result screen based on score %

---

## Seed Data

- 2 subjects: **Math**, **Science** (grade 8)
- 1 study material per subject (short markdown, English)
- 1 quiz per subject (5 MCQ questions)

---

## Out of Scope
- Video content
- Teacher/admin dashboard
- Leaderboards
- True PWA offline
