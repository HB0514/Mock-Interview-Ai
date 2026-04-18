import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, User, ArrowRight, Mic } from 'lucide-react'
import useInterviewStore from '../store/useInterviewStore'
import { initOpenAI } from '../services/openai'

export default function Landing() {
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUserInfo, setPhase } = useInterviewStore()

  const handleStart = () => {
    if (!name.trim()) return setError('Please enter your name')
    if (!apiKey.trim()) return setError('Please enter your Gemini API key')

    setLoading(true)
    setError('')
    try {
      initOpenAI(apiKey.trim())
      setUserInfo(name.trim(), apiKey.trim())
      setPhase('avatar')
    } catch (e) {
      setError('Failed to initialize. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            <Mic size={36} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Interview<span className="text-gradient">AI</span>
          </h1>
          <p className="text-slate-400 text-base">Your AI-powered mock interview coach</p>
        </div>

        {/* Feature pills */}
        <div className="flex gap-3 mb-8">
          {['AI Interviewer', 'Voice Q&A', 'Instant Feedback'].map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex-1 glass-card text-center py-2 px-1"
            >
              <p className="text-xs text-slate-300 font-medium">{f}</p>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 space-y-5"
        >
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <User size={14} /> Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              placeholder="e.g. Hyunbin"
              className="input-field"
            />
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <KeyRound size={14} /> Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="AIza..."
                className="input-field pr-16"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              무료 키 발급 →{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                aistudio.google.com
              </a>
              {' '}· 브라우저에만 저장, 서버 전송 없음
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner" /> : <><span>Get Started</span> <ArrowRight size={18} /></>}
          </button>
        </motion.div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Powered by Gemini 1.5 Flash · Browser TTS · 100% Free
        </p>
      </motion.div>
    </div>
  )
}
