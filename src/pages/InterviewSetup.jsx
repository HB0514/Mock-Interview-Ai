import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Brain, Megaphone, Palette, Users } from 'lucide-react'
import useInterviewStore from '../store/useInterviewStore'

const INTERVIEW_TYPES = [
  {
    id: 'behavioral',
    label: 'Behavioral',
    icon: Users,
    description: 'STAR-format questions on past experience',
    color: '#6366f1',
  },
  {
    id: 'pm',
    label: 'Product Manager',
    icon: Brain,
    description: 'Product sense, prioritization & strategy',
    color: '#8b5cf6',
  },
  {
    id: 'swe',
    label: 'Software Engineer',
    icon: Briefcase,
    description: 'Technical depth & system design questions',
    color: '#06b6d4',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    description: 'Campaign strategy, data & brand thinking',
    color: '#f59e0b',
  },
  {
    id: 'design',
    label: 'UX / Design',
    icon: Palette,
    description: 'Design process, user research & critique',
    color: '#ec4899',
  },
]

const DIFFICULTIES = [
  { id: 'beginner', label: 'Entry Level', sub: '0–2 yrs' },
  { id: 'intermediate', label: 'Mid Level', sub: '3–5 yrs' },
  { id: 'senior', label: 'Senior', sub: '5+ yrs' },
]

export default function InterviewSetup() {
  const [selectedType, setSelectedType] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [error, setError] = useState('')

  const { setInterviewConfig, setPhase } = useInterviewStore()

  const handleStart = () => {
    if (!selectedType) return setError('Please select an interview type')
    setError('')
    setInterviewConfig(selectedType, jobRole || null, difficulty)
    setPhase('interview')
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Set Up Your <span className="text-gradient">Interview</span>
          </h2>
          <p className="text-slate-400">
            Configure the interview to match your target role
          </p>
        </div>

        {/* Interview Type */}
        <div className="glass-card p-6 mb-4">
          <p className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Interview Type
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INTERVIEW_TYPES.map(({ id, label, icon: Icon, description, color }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(id)}
                className={`type-card ${selectedType === id ? 'type-card-active' : ''}`}
                style={selectedType === id ? { borderColor: color, boxShadow: `0 0 20px ${color}33` } : {}}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: `${color}22` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-tight">{description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Job Role (optional) */}
        <div className="glass-card p-6 mb-4">
          <label className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider block">
            Target Role <span className="text-slate-500 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g. Product Manager at Kakao, Senior SWE at Naver…"
            className="input-field"
          />
        </div>

        {/* Difficulty */}
        <div className="glass-card p-6 mb-6">
          <p className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Experience Level
          </p>
          <div className="flex gap-3">
            {DIFFICULTIES.map(({ id, label, sub }) => (
              <button
                key={id}
                onClick={() => setDifficulty(id)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  difficulty === id
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-glow'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="font-semibold">{label}</div>
                <div className="text-xs opacity-60 mt-0.5">{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleStart}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
        >
          Start Interview <ArrowRight size={20} />
        </button>

        <p className="text-center text-slate-600 text-xs mt-4">
          The interview will have 6 questions · ~10–15 minutes
        </p>
      </motion.div>
    </div>
  )
}
