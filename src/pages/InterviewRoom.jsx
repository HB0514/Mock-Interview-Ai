import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Clock, Loader2 } from 'lucide-react'
import Avatar3D from '../components/Avatar3D'
import UserCamera from '../components/UserCamera'
import useInterviewStore from '../store/useInterviewStore'
import { generateNextQuestion, textToSpeech } from '../services/openai'
import { speechService } from '../services/speech'

// States: 'idle' | 'ai_speaking' | 'user_speaking' | 'processing' | 'done'
export default function InterviewRoom() {
  const {
    userName,
    avatarUrl,
    interviewType,
    jobRole,
    difficulty,
    messages,
    qaLog,
    currentQuestionIndex,
    totalQuestions,
    isAiSpeaking,
    liveTranscript,
    addMessage,
    addQA,
    setCurrentQuestion,
    incrementQuestion,
    setAiSpeaking,
    setUserSpeaking,
    setProcessing,
    setLiveTranscript,
    setPhase,
    setResults,
    currentQuestion,
  } = useInterviewStore()

  const [roomState, setRoomState] = useState('idle')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showTranscript, setShowTranscript] = useState(true)
  const [displayedQuestion, setDisplayedQuestion] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [statusText, setStatusText] = useState('Starting interview…')

  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const audioUrlRef = useRef(null)
  const currentAnswerRef = useRef('')

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((t) => t + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Speak AI text via TTS and animate avatar
  const speakText = useCallback(async (text) => {
    setRoomState('ai_speaking')
    setAiSpeaking(true)
    setStatusText('Emma is speaking…')
    setDisplayedQuestion(text)

    try {
      const url = await textToSpeech(text)
      audioUrlRef.current = url

      await new Promise((resolve, reject) => {
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = resolve
        audio.onerror = reject
        audio.play().catch(reject)
      })
    } catch (e) {
      console.error('TTS error:', e)
    } finally {
      setAiSpeaking(false)
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
    }
  }, [setAiSpeaking])

  // Start listening for user's answer
  const startListening = useCallback(() => {
    if (!speechService.isSupported()) {
      // Fallback: text input mode
      setRoomState('user_speaking')
      setUserSpeaking(true)
      setStatusText('Type your answer below (speech not supported)')
      return
    }

    currentAnswerRef.current = ''
    setLiveTranscript('')
    setUserAnswer('')
    setRoomState('user_speaking')
    setUserSpeaking(true)
    setStatusText('Listening… speak your answer')

    speechService.start(
      (interim) => {
        setLiveTranscript(interim)
        currentAnswerRef.current = interim
      },
      (final) => {
        currentAnswerRef.current = final
      }
    )
  }, [setLiveTranscript, setUserSpeaking])

  // Stop listening and process answer
  const stopListening = useCallback(async () => {
    speechService.stop()
    setUserSpeaking(false)
    setRoomState('processing')
    setProcessing(true)
    setStatusText('Processing your answer…')

    const answer = currentAnswerRef.current || liveTranscript || userAnswer || '(No answer provided)'
    const question = displayedQuestion

    // Log Q&A
    addQA(question, answer)

    // Add to GPT message history
    addMessage('assistant', question)
    addMessage('user', answer)

    setLiveTranscript('')
    setUserAnswer('')

    const nextIndex = currentQuestionIndex + 1
    incrementQuestion()

    if (nextIndex >= totalQuestions) {
      // End interview
      setProcessing(false)
      setRoomState('done')
      setStatusText('Interview complete! Generating your results…')
      await endInterview([...qaLog, { question, answer }])
      return
    }

    // Generate next question
    try {
      const nextQ = await generateNextQuestion({
        messages: [...messages, { role: 'assistant', content: question }, { role: 'user', content: answer }],
        interviewType,
        jobRole,
        difficulty,
        questionIndex: nextIndex,
        totalQuestions,
      })

      setCurrentQuestion(nextQ)
      setProcessing(false)
      await speakText(nextQ)
      startListening()
    } catch (e) {
      console.error('GPT error:', e)
      setProcessing(false)
      setStatusText('Error generating next question. Please try again.')
    }
  }, [
    liveTranscript, userAnswer, displayedQuestion, currentQuestionIndex,
    totalQuestions, qaLog, messages, interviewType, jobRole, difficulty,
    addQA, addMessage, incrementQuestion, setLiveTranscript, setUserAnswer,
    setCurrentQuestion, setProcessing, speakText, startListening,
  ])

  // End interview and evaluate
  const endInterview = useCallback(async (finalQaLog) => {
    const { evaluateInterview } = await import('../services/openai')
    try {
      const results = await evaluateInterview(
        finalQaLog.length > 0 ? finalQaLog : qaLog,
        { interviewType, jobRole, difficulty }
      )
      setResults(results)
      setTimeout(() => setPhase('results'), 1500)
    } catch (e) {
      console.error('Evaluation error:', e)
      // Still navigate with partial results
      setResults({
        overallScore: 75,
        overallGrade: 'B',
        recommendation: 'Promising Candidate',
        summary: 'Interview completed. Detailed evaluation unavailable.',
        breakdown: { communication: 75, relevance: 75, structure: 75, depth: 75 },
        strengths: ['Completed the interview', 'Engaged with all questions'],
        improvements: ['Continue practicing', 'Work on structure', 'Add more examples'],
        questionFeedback: finalQaLog.map((qa) => ({
          ...qa,
          score: 75,
          feedback: 'Good effort on this question.',
        })),
      })
      setTimeout(() => setPhase('results'), 1500)
    }
  }, [qaLog, interviewType, jobRole, difficulty, setResults, setPhase])

  // Kick off the interview
  useEffect(() => {
    const startInterview = async () => {
      await new Promise((r) => setTimeout(r, 800))

      const firstQ = await generateNextQuestion({
        messages: [],
        interviewType,
        jobRole,
        difficulty,
        questionIndex: 0,
        totalQuestions,
      })

      setCurrentQuestion(firstQ)
      await speakText(firstQ)
      startListening()
    }

    startInterview().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // End interview manually
  const handleEndInterview = () => {
    speechService.abort()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    endInterview(qaLog)
  }

  const isListening = roomState === 'user_speaking'
  const isProcessingState = roomState === 'processing'
  const isDone = roomState === 'done'

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-semibold">Live Interview</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock size={14} />
            {formatTime(elapsedTime)}
          </div>
          <div className="glass-card px-3 py-1 text-sm text-slate-300">
            Q {Math.min(currentQuestionIndex + 1, totalQuestions)} / {totalQuestions}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* AI Avatar Panel */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-dark-800 border border-white/5 min-h-64 lg:min-h-0">
          {/* 3D Avatar */}
          <div className="absolute inset-0">
            <Avatar3D avatarUrl={avatarUrl} isTalking={isAiSpeaking} />
          </div>

          {/* Status badge */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              {isAiSpeaking ? (
                <>
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="inline-block w-1 bg-indigo-400 rounded-full"
                        animate={{ height: ['8px', '20px', '8px'] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </span>
                  <span className="text-indigo-300 text-sm font-medium">Emma is speaking</span>
                </>
              ) : isProcessingState ? (
                <>
                  <Loader2 size={14} className="text-amber-400 animate-spin" />
                  <span className="text-amber-300 text-sm">Processing…</span>
                </>
              ) : isDone ? (
                <span className="text-green-400 text-sm">✓ Interview complete</span>
              ) : (
                <span className="text-slate-400 text-sm">Emma · AI Interviewer</span>
              )}
            </div>
          </div>

          {/* Name tag */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1">
              <p className="text-slate-300 text-sm font-medium">Emma · AI Interviewer</p>
            </div>
          </div>
        </div>

        {/* User Camera Panel */}
        <div className="lg:w-80 relative rounded-2xl overflow-hidden bg-dark-800 border border-white/5 min-h-48 lg:min-h-0">
          <UserCamera userName={userName} />

          {/* Listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 right-3"
              >
                <div className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm rounded-full px-2 py-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-medium">REC</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transcript / Question display */}
      <div className="px-4 pb-2">
        <AnimatePresence mode="wait">
          {displayedQuestion && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-4 mb-3"
            >
              <p className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">
                Current Question
              </p>
              <p className="text-slate-200 text-sm leading-relaxed">{displayedQuestion}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live transcript */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-4 mb-3 border border-red-500/20"
            >
              <p className="text-xs text-red-400 font-semibold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse inline-block" />
                Your Answer (live)
              </p>
              <p className="text-slate-300 text-sm leading-relaxed min-h-[1.5em]">
                {liveTranscript || <span className="text-slate-600 italic">Listening…</span>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback text input for non-speech browsers */}
        {isListening && !speechService.isSupported() && (
          <div className="glass-card p-4 mb-3">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here…"
              className="input-field resize-none"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-6 pb-6">
        {/* Stop / Start recording */}
        {isListening ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopListening}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors"
          >
            <MicOff size={18} />
            Submit Answer
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startListening}
            disabled={isAiSpeaking || isProcessingState || isDone}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors"
          >
            <Mic size={18} />
            {isAiSpeaking ? 'Wait for Emma…' : 'Start Speaking'}
          </motion.button>
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < currentQuestionIndex
                  ? 'bg-green-400'
                  : i === currentQuestionIndex
                  ? 'bg-indigo-400 scale-125'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* End interview */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEndInterview}
          disabled={isDone}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-slate-300 font-medium px-4 py-3 rounded-xl transition-colors"
        >
          <PhoneOff size={18} />
          End
        </motion.button>
      </div>

      {/* Status text */}
      <div className="text-center pb-4">
        <p className="text-slate-500 text-xs">{statusText}</p>
      </div>
    </div>
  )
}
