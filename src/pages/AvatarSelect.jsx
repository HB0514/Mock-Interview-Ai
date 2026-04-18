import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import useInterviewStore from '../store/useInterviewStore'

export const AVATARS = [
  { id: 'robot',   emoji: '🤖', name: 'Robo',   bg: 'from-cyan-500 to-blue-600',     desc: 'Logical & precise' },
  { id: 'fox',     emoji: '🦊', name: 'Fiona',  bg: 'from-orange-400 to-red-500',    desc: 'Sharp & clever' },
  { id: 'cat',     emoji: '🐱', name: 'Cleo',   bg: 'from-purple-400 to-pink-500',   desc: 'Cool & curious' },
  { id: 'panda',   emoji: '🐼', name: 'Pablo',  bg: 'from-slate-400 to-gray-700',    desc: 'Calm & thorough' },
  { id: 'unicorn', emoji: '🦄', name: 'Uma',    bg: 'from-pink-400 to-violet-500',   desc: 'Creative & bold' },
  { id: 'frog',    emoji: '🐸', name: 'Felix',  bg: 'from-green-400 to-emerald-600', desc: 'Friendly & fun' },
  { id: 'owl',     emoji: '🦉', name: 'Oscar',  bg: 'from-amber-400 to-orange-600',  desc: 'Wise & thorough' },
  { id: 'penguin', emoji: '🐧', name: 'Penny',  bg: 'from-blue-400 to-indigo-600',   desc: 'Focused & direct' },
]

export default function AvatarSelect() {
  const [selected, setSelected] = useState('robot')
  const { setAvatarId, setPhase, userName } = useInterviewStore()

  const handleConfirm = () => {
    setAvatarId(selected)
    setPhase('setup')
  }

  const selectedAvatar = AVATARS.find((a) => a.id === selected)

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Choose Your <span className="text-gradient">AI Interviewer</span>
          </h2>
          <p className="text-slate-400">
            Pick a character to guide your mock interview, {userName} 👋
          </p>
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {AVATARS.map((av) => (
            <motion.button
              key={av.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(av.id)}
              className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all border-2 ${
                selected === av.id
                  ? 'border-indigo-500 bg-indigo-500/15 shadow-glow'
                  : 'border-white/8 bg-white/4 hover:border-white/20'
              }`}
            >
              {/* Check badge */}
              {selected === av.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
                >
                  <Check size={11} className="text-white" />
                </motion.div>
              )}

              {/* Emoji with gradient bg */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-3xl shadow-lg`}
              >
                {av.emoji}
              </div>
              <p className="text-white text-xs font-semibold">{av.name}</p>
              <p className="text-slate-500 text-[10px] leading-tight text-center">{av.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Preview of selected */}
        {selectedAvatar && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-5 flex items-center gap-4"
          >
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedAvatar.bg} flex items-center justify-center text-4xl shadow-xl flex-shrink-0`}
            >
              {selectedAvatar.emoji}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{selectedAvatar.name}</p>
              <p className="text-slate-400 text-sm">{selectedAvatar.desc}</p>
              <p className="text-indigo-400 text-xs mt-1">Selected as your AI interviewer</p>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleConfirm}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
        >
          Interview with {selectedAvatar?.name} <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  )
}
