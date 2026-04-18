# InterviewAI — AI Mock Interview Coach
AI-powered mock interview coach built with Gemini, OpenAI TTS, and Ready Player Me.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

---

## Built For
Likelion Hackathon 2026

## Overview
InterviewAI is a real-time AI mock interview platform where an AI interviewer asks role-specific questions, listens to spoken answers, and delivers actionable feedback instantly.

Instead of vague feedback like “your answer is weak,” InterviewAI explains **why** an answer falls short and **how** to improve it with clearer structure, stronger examples, and measurable impact.

---

## The Problem
- Practicing alone is difficult because there is no real feedback loop
- Most online interview resources are generic and not personalized
- It is hard to know exactly why an answer feels weak

## Our Solution
InterviewAI simulates a live interview experience and evaluates responses across:
- **Structure** — logical flow, STAR usage
- **Content** — relevance and specificity
- **Impact** — measurable outcomes and metrics
- **Delivery** — clarity and answer length
  
---

## Features
- Real-time AI-generated interview questions
- Voice-based answers using browser speech recognition
- AI feedback after each response
- Role-specific interview modes
- 3D avatar-based interview experience
- Final results screen with score breakdown

### Interview Types
- Behavioral
- Product Manager (PM)
- Software Engineer (SWE)
- Marketing
- UI/UX Design
  
---

## Demo Flow
Landing → Avatar Select → Interview Setup → Interview Room → Results

### Core Experience
- Enter name and Gemini API key
- Customize a 3D avatar
- Select role and experience level
- Answer interview questions by voice
- Receive feedback and scoring instantly

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Google AI Studio API Key**
- **Chrome** — recommended for best Web Speech API compatibility
- **Webcam** — optional, app works without it

### Installation

```bash
git clone https://github.com/HB0514/Mock-Interview-Ai.git
cd Mock-Interview-Ai
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> Your API key is entered on the **Landing screen** inside the app. Never hardcode it in the source.

---

## Product Walkthrough

| Screen | Description |
|--------|-------------|
| Landing | Enter your name and Gemini API key |
| Avatar Select | Customize a 3D avatar via Ready Player Me iframe |
| Interview Setup | Choose interview type and experience level |
| Interview Room | Zoom-style UI — AI avatar speaks questions, you answer by voice |
| Results | Overall score, dimension breakdown, and per-question feedback |


### Answer Evaluation Dimensions

| Dimension | What's Measured |
|-----------|-----------------|
| Structure | Logical flow, STAR method usage |
| Content | Role relevance, specificity of examples |
| Impact | Use of metrics, measurable outcomes |
| Delivery | Answer length, clarity |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| AI (Q&A + Evaluation) | Gemini |
| Voice Output | OpenAI TTS-1 (optional) |
| Speech Recognition | Web Speech API |
| Avatar | Ready Player Me |
| 3D Rendering | @react-three/fiber + drei |
| State Management | Zustand |
| Animation | Framer Motion |

---

## Architecture

```
Landing → AvatarSelect → InterviewSetup → InterviewRoom → Results
                                                ↑
                                      [Gemini: question generation]
                                      [TTS-1:  voice output]
                                      [Web Speech: voice input]
                                      [Gemini: answer evaluation]
```

### Interview Room State Machine

```
idle
  └→ ai_speaking       (AI reads the question aloud)
       └→ user_speaking (user records voice answer)
            └→ processing (Gemini analyzes the response)
                 └→ ai_speaking  (next question)
                      ⋮
                      └→ results  (after final question)
```

---

## Challenges We Ran Into
- Making browser-based speech recognition feel reliable
- Coordinating voice input, TTS, and AI evaluation in one flow
- Designing feedback that is specific, useful, and fast
- Keeping the interview experience immersive with a 3D avatar

## What We Learned
- Real-time AI UX depends heavily on flow control and latency handling
- Good interview feedback needs structure, not just general encouragement
- Small product choices can make an AI experience feel much more human

---

## Target Users

- College students preparing for internships or full-time roles
- Career changers entering a new industry
- International students preparing for English-language interviews
- Anyone who wants structured, honest feedback on their answers

---

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/             # Landing, AvatarSelect, Setup, InterviewRoom, Results
├── store/             # Zustand global state
├── hooks/             # Custom hooks (speech recognition, etc.)
└── utils/             # AI prompts, TTS helpers, scoring logic
```

---

## What's Next
- Save interview history and progress over time
- Add more interview categories and custom rubrics
- Personalize feedback based on user patterns
- Deploy a live hosted version with authentication

---

## Contributing

This project was built for a hackathon. Issues and PRs are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
