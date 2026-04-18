# InterviewAI — AI Mock Interview Coach

> AI-powered mock interview coach built with GPT-4o · OpenAI TTS · Ready Player Me 3D Avatar

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)

---

## Overview

**InterviewAI** is an AI-powered mock interview platform where an AI interviewer asks role-specific questions in real time, analyzes your responses, and delivers actionable feedback — instantly.

Most people practice interviews without knowing what they're doing wrong. InterviewAI solves that by explaining **why** your answer is weak and **exactly how** to improve it.

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **OpenAI API Key** (`sk-...`)
- **Chrome or Edge** — required for Web Speech API (speech recognition)
- **Webcam** — optional, app works without it

### Installation

```bash
git clone https://github.com/your-username/interview-ai.git
cd interview-ai
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> Your API key is entered on the **Landing screen** inside the app. Never hardcode it in the source.

---

## Features

| Screen | Description |
|--------|-------------|
| Landing | Enter your name and OpenAI API key |
| Avatar Select | Customize a 3D avatar via Ready Player Me iframe |
| Interview Setup | Choose interview type and experience level |
| Interview Room | Zoom-style UI — AI avatar speaks questions, you answer by voice |
| Results | Overall score, dimension breakdown, and per-question feedback |

### Interview Types

- Behavioral
- Product Manager (PM)
- Software Engineer (SWE)
- Marketing
- Design

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
| AI Question & Evaluation | OpenAI GPT-4o |
| AI Voice Output | OpenAI TTS-1 (Nova) |
| Speech Recognition (STT) | Web Speech API |
| 3D Avatar | Ready Player Me |
| 3D Rendering & Lip Sync | @react-three/fiber + drei |
| State Management | Zustand |
| Page Transitions | Framer Motion |

---

## Architecture

```
Landing → AvatarSelect → InterviewSetup → InterviewRoom → Results
                                                ↑
                                      [GPT-4o: question generation]
                                      [TTS-1:  voice output]
                                      [Web Speech: voice input]
                                      [GPT-4o: answer evaluation]
```

### Interview Room State Machine

```
idle
  └→ ai_speaking       (AI reads the question aloud)
       └→ user_speaking (user records voice answer)
            └→ processing (GPT-4o analyzes the response)
                 └→ ai_speaking  (next question)
                      ⋮
                      └→ results  (after final question)
```

---

## Problem & Solution

### The Problem

- Practicing alone is difficult — no real feedback loop
- Generic online resources aren't personalized
- Hard to know *why* an answer falls flat

### Our Solution

Instead of vague feedback like *"Your answer is weak"*, InterviewAI tells you:

> "Your answer lacks quantified impact. Consider adding measurable results such as % improvement or revenue impact."

**Before / After Example:**

| | Answer |
|---|--------|
| Before | "I worked on a project and improved things." |
| After | "I led a project where I improved user retention by 15% by analyzing behavioral data and implementing targeted recommendations." |

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
└── utils/             # GPT prompts, TTS helpers, scoring logic
```

---

## Contributing

This project was built for a hackathon. Issues and PRs are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License — free to use, modify, and distribute.
