import { create } from 'zustand'

const useInterviewStore = create((set) => ({
  // User info
  userName: '',
  apiKey: '',

  // Avatar — stores an ID like 'robot', 'fox', 'cat' …
  avatarId: 'robot',

  // Interview config
  interviewType: null,
  jobRole: '',
  difficulty: 'intermediate',

  // App phase
  phase: 'landing',

  // Conversation
  messages: [],
  qaLog: [],
  currentQuestion: '',
  currentQuestionIndex: 0,
  totalQuestions: 6,

  // Runtime state
  isAiSpeaking: false,
  isUserSpeaking: false,
  isProcessing: false,
  liveTranscript: '',

  // Results
  results: null,

  // ── Actions ─────────────────────────────────────────────────
  setUserInfo: (userName, apiKey) => set({ userName, apiKey }),
  setAvatarId: (id) => set({ avatarId: id }),
  setInterviewConfig: (interviewType, jobRole, difficulty) =>
    set({ interviewType, jobRole, difficulty }),
  setPhase: (phase) => set({ phase }),

  addMessage: (role, content) =>
    set((state) => ({ messages: [...state.messages, { role, content }] })),

  addQA: (question, answer) =>
    set((state) => ({ qaLog: [...state.qaLog, { question, answer }] })),

  setCurrentQuestion: (q) => set({ currentQuestion: q }),
  incrementQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

  setAiSpeaking: (val) => set({ isAiSpeaking: val }),
  setUserSpeaking: (val) => set({ isUserSpeaking: val }),
  setProcessing: (val) => set({ isProcessing: val }),
  setLiveTranscript: (text) => set({ liveTranscript: text }),
  setResults: (results) => set({ results }),

  reset: () =>
    set({
      messages: [],
      qaLog: [],
      currentQuestion: '',
      currentQuestionIndex: 0,
      isAiSpeaking: false,
      isUserSpeaking: false,
      isProcessing: false,
      liveTranscript: '',
      results: null,
      phase: 'landing',
      avatarId: 'robot',
    }),
}))

export default useInterviewStore
