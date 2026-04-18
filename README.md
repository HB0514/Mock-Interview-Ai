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
