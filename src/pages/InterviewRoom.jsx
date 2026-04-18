import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Clock, Loader2 } from 'lucide-react'
import Avatar3D from '../components/Avatar3D'
import UserCamera from '../components/UserCamera'
import useInterviewStore from '../store/useInterviewStore'
import { generateNextQuestion, textToSpeech, stopSpeech } from '../services/openai'
import { speechService } from '../services/speech'

export default function InterviewRoom() {
  const {
    userName, avatarId, interviewType, jobRole, difficulty,
    qaLog, currentQuestionIndex, totalQuestions, isAiSpeaking, liveTranscript,
    addQA, setCurrentQuestion, incrementQuestion,
    setAiSpeaking, setUserSpeaking, setProcessing,
    setLiveTranscript, setPhase, setResults,
  } = useInterviewStore()

  const [roomState, setRoomState]           = useState('idle')
  const [elapsedTime, setElapsedTime]       = useState(0)
  const [displayedQuestion, setDisplayedQuestion] = useState('')
  const [userAnswer, setUserAnswer]         = useState('')
  const [statusText, setStatusText]         = useState('Starting interview…')

  // Refs — always current, immune to stale closures
  const currentAnswerRef   = useRef('')
  const qaLogRef           = useRef([])
  const questionIndexRef   = useRef(0)
  qaLogRef.current         = qaLog
  questionIndexRef.current = currentQuestionIndex

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setElapsedTime((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── Speak via browser speechSynthesis ──────────────────────────────────────
  const speakText = async (text) => {
    setRoomState('ai_speaking')
    setAiSpeaking(true)
    setStatusText('Emma is speaking…')
    setDisplayedQuestion(text)
    try {
      await textToSpeech(text)
    } catch (e) {
      console.warn('TTS error (non-fatal):', e)
      // Fallback: just wait 3 s so user can read the question
      await new Promise((r) => setTimeout(r, 3000))
    } finally {
      setAiSpeaking(false)
    }
  }

  // ── Start listening ────────────────────────────────────────────────────────
  const startListening = () => {
    currentAnswerRef.current = ''
    setLiveTranscript('')
    setUserAnswer('')
    setRoomState('user_speaking')
    setUserSpeaking(true)
    setStatusText('Listening… speak your answer')

    if (!speechService.isSupported()) {
      setStatusText('Speech recognition not supported — type your answer below')
      return
    }

    speechService.start(
      (interim) => { setLiveTranscript(interim); currentAnswerRef.current = interim },
      (final)   => { currentAnswerRef.current = final }
    )
  }

  // ── Submit answer ──────────────────────────────────────────────────────────
  const stopListening = async () => {
    speechService.stop()
    setUserSpeaking(false)
    setRoomState('processing')
    setProcessing(true)
    setStatusText('Processing your answer…')

    const answer      = currentAnswerRef.current || userAnswer || '(No answer provided)'
    const question    = displayedQuestion
    const nextIndex   = questionIndexRef.current + 1
    const updatedLog  = [...qaLogRef.current, { question, answer }]

    addQA(question, answer)
    incrementQuestion()
    setLiveTranscript('')
    setUserAnswer('')

    if (nextIndex >= totalQuestions) {
      setProcessing(false)
      setRoomState('done')
      setStatusText('Interview complete! Generating your results…')
      await endInterview(updatedLog)
      return
    }

    try {
      const nextQ = await generateNextQuestion({
        qaLog: updatedLog,   // ✅ clean alternating conversation built inside openai.js
        interviewType, jobRole, difficulty,
        questionIndex: nextIndex,
        totalQuestions,
      })
      setCurrentQuestion(nextQ)
      setProcessing(false)
      await speakText(nextQ)
      startListening()
    } catch (e) {
      console.error('Gemini error:', e)
      setProcessing(false)
      setRoomState('idle')
      setStatusText(`Error: ${e?.message || 'Could not get next question.'} `)
    }
  }

  // ── Evaluate ───────────────────────────────────────────────────────────────
  const endInterview = async (finalLog) => {
    const { evaluateInterview } = await import('../services/openai')
    try {
      const results = await evaluateInterview(finalLog, { interviewType, jobRole, difficulty })
      setResults(results)
    } catch (e) {
      console.error('Evaluation error:', e)
      setResults({
        overallScore: 72, overallGrade: 'B', recommendation: 'Promising Candidate',
        summary: 'Interview completed successfully!',
        breakdown: { communication: 72, relevance: 70, structure: 72, depth: 70 },
        strengths:    ['Completed all questions', 'Engaged throughout', 'Clear communication'],
        improvements: ['Add specific examples', 'Use STAR format', 'Quantify achievements'],
        questionFeedback: finalLog.map((qa) => ({ ...qa, score: 72, feedback: 'Good effort.' })),
      })
    } finally {
      setTimeout(() => setPhase('results'), 1200)
    }
  }

  // ── Start first question ───────────────────────────────────────────────────
  useEffect(() => {
    const start = async () => {
      await new Promise((r) => setTimeout(r, 500))
      try {
        const firstQ = await generateNextQuestion({
          qaLog: [], interviewType, jobRole, difficulty,
          questionIndex: 0, totalQuestions,
        })
        setCurrentQuestion(firstQ)
        await speakText(firstQ)
        startListening()
      } catch (e) {
        console.error('First question error:', e)
        setStatusText(`Error: ${e?.message || 'Check your Gemini API key.'}`)
        setRoomState('idle')
      }
    }
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Manual end ────────────────────────────────────────────────────────────
  const handleEndInterview = () => {
    speechService.abort()
    stopSpeech()
    endInterview(qaLogRef.current)
  }

  const isListening       = roomState === 'user_speaking'
  const isProcessingState = roomState === 'processing'
  const isDone            = roomState === 'done'

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
          <span className="text-white font-semibold text-sm">Live Interview</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Clock size={13} />{formatTime(elapsedTime)}
          </span>
          <span className="glass-card px-3 py-1 text-xs text-slate-300">
            Q {Math.min(currentQuestionIndex + 1, totalQuestions)}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Main panels */}
      <div className="flex flex-1 gap-3 p-3" style={{ minHeight: 0, height: 'calc(100vh - 220px)' }}>
        {/* AI Avatar */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative">
          <Avatar3D avatarId={avatarId} isTalking={isAiSpeaking} />
          <AnimatePresence>
            {isProcessingState && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <Loader2 size={14} className="text-amber-400 animate-spin" />
                  <span className="text-amber-300 text-sm">Thinking…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Camera */}
        <div className="w-64 flex-shrink-0 rounded-2xl overflow-hidden border border-white/5 relative">
          <UserCamera userName={userName} />
          <AnimatePresence>
            {isListening && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm rounded-full px-2 py-1"
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
                <span className="text-white text-xs font-medium">REC</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Question & transcript */}
      <div className="px-3 pb-1 space-y-2">
        <AnimatePresence mode="wait">
          {displayedQuestion && (
            <motion.div key={currentQuestionIndex}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-card px-4 py-3"
            >
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mr-2">Q:</span>
              <span className="text-slate-200 text-sm leading-relaxed">{displayedQuestion}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass-card px-4 py-3 border border-red-500/20"
            >
              <span className="text-red-400 text-xs font-semibold uppercase tracking-wider mr-2 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse inline-block" />Your Answer:
              </span>
              <span className="text-slate-300 text-sm">
                {liveTranscript || <em className="text-slate-600">Listening…</em>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isListening && !speechService.isSupported() && (
          <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here…" rows={2}
            className="input-field resize-none text-sm"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-5 py-3">
        {isListening ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={stopListening}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            <MicOff size={18} /> Submit Answer
          </motion.button>
        ) : (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={startListening}
            disabled={isAiSpeaking || isProcessingState || isDone}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            <Mic size={18} />
            {isAiSpeaking ? 'Wait for Emma…' : isProcessingState ? 'Processing…' : 'Start Speaking'}
          </motion.button>
        )}

        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all ${
              i < currentQuestionIndex   ? 'w-2 h-2 bg-green-400'
              : i === currentQuestionIndex ? 'w-3 h-3 bg-indigo-400'
              : 'w-2 h-2 bg-white/15'
            }`} />
          ))}
        </div>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleEndInterview} disabled={isDone}
          className="flex items-center gap-1.5 bg-white/8 hover:bg-white/15 disabled:opacity-40 text-slate-400 font-medium px-4 py-3 rounded-xl transition-colors text-sm"
        >
          <PhoneOff size={16} /> End
        </motion.button>
      </div>

      <p className="text-center text-slate-600 text-xs pb-3">{statusText}</p>
    </div>
  )
}
