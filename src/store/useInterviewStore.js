import { create } from 'zustand'

const useInterviewStore = create((set, get) => ({
  // User info
  userName: '',
  apiKey: '',

  // Avatar
  avatarUrl: null, // RPM GLB URL

  // Interview config
  interviewType: null, // 'behavioral' | 'pm' | 'swe' | 'marketing' | 'design'
  jobRole: '',
  difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'senior'

  // App phase
  phase: 'landing', // 'landing' | 'avatar' | 'setup' | 'interview' | 'results'

  // Conversation
  messages: [],       // full GPT conversation history
  qaLog: [],          // [{question, answer}] for display and evaluation
  currentQuestion: '',
  currentQuestionIndex: 0,
  totalQuestions: 6,

  // Interview runtime state
  isAiSpeaking: false,
  isUserSpeaking: false,
  isProcessing: false,
  liveTranscript: '',  // real-time speech recognition text
  interviewStarted: false,

  // Results
  results: null,

  // Actions
  setUserInfo: (userName, apiKey) => set({ userName, apiKey }),
  setAvatarUrl: (url) => set({ avatarUrl: url }),
  setInterviewConfig: (interviewType, jobRole, difficulty) =>
    set({ interviewType, jobRole, difficulty }),
  setPhase: (phase) => set({ phase }),

  addMessage: (role, content) =>
    set((state) => ({
      messages: [...state.messages, { role, content }],
    })),

  addQA: (question, answer) =>
    set((state) => ({
      qaLog: [...state.qaLog, { question, answer }],
    })),

  setCurrentQuestion: (q) => set({ currentQuestion: q }),
  incrementQuestion: () =>
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  setAiSpeaking: (val) => set({ isAiSpeaking: val }),
  setUserSpeaking: (val) => set({ isUserSpeaking: val }),
  setProcessing: (val) => set({ isProcessing: val }),
  setLiveTranscript: (text) => set({ liveTranscript: text }),
  setInterviewStarted: (val) => set({ interviewStarted: val }),
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
      interviewStarted: false,
      results: null,
      phase: 'landing',
      avatarUrl: null,
    }),
}))

export default useInterviewStore
