<<<<<<< HEAD
# 🎤 InterviewAI — AI Mock Interview Coach

해커톤 프로젝트: GPT-4o + OpenAI TTS + Ready Player Me 3D 아바타로 구현한 AI 모의 면접 코치

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 열기 (Chrome/Edge 권장)

## 필요한 것

- **OpenAI API Key** — 앱 내 Landing 화면에서 입력 (sk-...)
- **Chrome 또는 Edge** — Web Speech API (음성 인식) 지원용
- **웹캠** (선택) — 없어도 동작함

## 기능

| 화면 | 설명 |
|------|------|
| Landing | 이름 + OpenAI API 키 입력 |
| Avatar Select | Ready Player Me iframe으로 3D 아바타 커스터마이즈 |
| Interview Setup | 면접 유형 (Behavioral / PM / SWE / Marketing / Design) + 경력 레벨 선택 |
| Interview Room | Zoom 스타일 UI — AI 아바타(음성)가 질문, 유저가 음성으로 답변 |
| Results | 전체 점수 + 항목별 분석 + 질문별 피드백 |

## 기술 스택

- **React 18** + Vite
- **OpenAI GPT-4o** — 질문 생성, 면접 평가
- **OpenAI TTS-1 (Nova)** — AI 음성 출력
- **Web Speech API** — 유저 음성 인식 (STT)
- **Ready Player Me** — 3D 하프바디 아바타
- **@react-three/fiber + drei** — 3D 아바타 렌더링 + 립싱크 애니메이션
- **Zustand** — 전역 상태 관리
- **Framer Motion** — 페이지 전환 애니메이션

## 아키텍처

```
Landing → AvatarSelect → InterviewSetup → InterviewRoom → Results
                                              ↑
                                    [GPT-4o: 질문 생성]
                                    [TTS-1: 음성 출력]
                                    [Web Speech: 음성 입력]
                                    [GPT-4o: 평가 생성]
```

## Interview Room 상태 머신

```
idle → ai_speaking → user_speaking → processing → ai_speaking → ...
                                                       ↓ (마지막 질문 후)
                                                    results
```
=======
# AI Interview Coach

An AI-powered interview coaching platform that provides real-time, personalized feedback to help users improve their interview performance.

---

## Problem Statement

Many students and job seekers struggle with interview preparation:

- Practicing alone is difficult  
- No clear feedback on answers  
- Hard to identify weaknesses  
- Generic online resources are not personalized  

Core Problem:  
Users do not know why their answers are weak or how to improve them.

---

## Solution Overview

### AI Interview Coach (Real-time + Personalized)

This platform:
- Simulates real interview scenarios  
- Analyzes user responses  
- Provides actionable feedback  
- Generates improved answers  

Goal:  
Replace passive practice with active, personalized coaching.

---

## Key Features (MVP)

### 1. Interview Simulation
- Role-based questions (e.g., Data Analyst, Business Analyst)  
- Optional Job Description input  
- Contextual interview questions  

---

### 2. Answer Analysis

User responses are evaluated across four dimensions:

**Structure**
- Logical flow  
- STAR method usage  

**Content**
- Relevance to the role  
- Specificity of examples  

**Impact**
- Use of metrics (percentages, numbers, outcomes)  
- Clear results  

**Delivery**
- Length appropriateness  
- Clarity  

---

### 3. Scoring System

Example:

- Structure: 6 / 10  
- Content: 7 / 10  
- Impact: 5 / 10  
- Delivery: 8 / 10  

Total Score: 6.5 / 10

---

### 4. Actionable Feedback (Core Differentiator)

Instead of generic feedback:

"Your answer is weak"

This system provides:

"Your answer lacks quantified impact. Consider adding measurable results such as percentage improvement or business outcomes."

---

### 5. Improved Answer Generation

User Answer:
I worked on a project and improved things.

Improved Answer:
I led a project where I improved user retention by 15% by analyzing behavioral data and implementing targeted recommendations.

This makes improvement clear and actionable.

---

## Product Structure

- Landing Page  
  Problem introduction and call to action  

- Setup Page  
  Role selection, experience level, optional Job Description input  

- Interview Page  
  Displays question and collects user response (text or voice)  

- Feedback Dashboard  
  Score breakdown, weakness analysis, suggestions, improved answer  

---

## Technical Approach

- NLP-based response evaluation  
- Keyword extraction  
- Structure detection (rule-based or LLM)  
- LLM-generated feedback and improved responses  

Note:  
A full machine learning model is not required for the MVP.  
The focus is on logic, usability, and clear feedback.

---

## Differentiation

Existing tools:
- Provide generic questions  
- Offer limited feedback  

This system:
- Explains why answers are weak  
- Provides specific guidance on how to improve them  

---

## Target Users

- College students  
- Internship applicants  
- Job seekers  
- International students preparing for interviews  

---

## Why This Idea Works

- Highly relatable problem  
- Easy to demonstrate  
- Strong AI use case  
- Clear before-and-after comparison  

---

## Pitch Summary

Most people practice interviews, but they do not know what they are doing wrong.  
This system analyzes responses and provides actionable feedback so users can improve immediately.

---

## Team Roles

- Frontend: UI and user flow  
- AI/Logic: response evaluation and feedback generation  
- Product/Presentation: story, slides, and demo  

---

## MVP Goal

Build a working prototype that:
- Simulates interview questions  
- Accepts user answers  
- Provides structured feedback  
- Shows improved answers  

Focus on clarity, usability, and demo impact.
>>>>>>> c1691b9946b0b2d1130bc4a7ab94ad8c374c618a
