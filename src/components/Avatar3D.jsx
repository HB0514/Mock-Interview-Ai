// CSS/Emoji based avatar — no Three.js dependency needed
import { motion } from 'framer-motion'

export const AVATAR_CONFIGS = {
  robot:   { emoji: '🤖', name: 'Robo',   bg: 'from-cyan-500 to-blue-600' },
  fox:     { emoji: '🦊', name: 'Fiona',  bg: 'from-orange-400 to-red-500' },
  cat:     { emoji: '🐱', name: 'Cleo',   bg: 'from-purple-400 to-pink-500' },
  panda:   { emoji: '🐼', name: 'Pablo',  bg: 'from-slate-400 to-gray-700' },
  unicorn: { emoji: '🦄', name: 'Uma',    bg: 'from-pink-400 to-violet-500' },
  frog:    { emoji: '🐸', name: 'Felix',  bg: 'from-green-400 to-emerald-600' },
  owl:     { emoji: '🦉', name: 'Oscar',  bg: 'from-amber-400 to-orange-600' },
  penguin: { emoji: '🐧', name: 'Penny',  bg: 'from-blue-400 to-indigo-600' },
}

// Animated sound-wave bars
function SoundWave({ active }) {
  const bars = [0.4, 0.9, 0.6, 1, 0.7, 0.5, 0.8]
  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((base, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-white/70"
          animate={
            active
              ? { height: ['4px', `${base * 28 + 4}px`, '4px'] }
              : { height: '4px' }
          }
          transition={{
            duration: 0.45,
            delay: i * 0.06,
            repeat: active ? Infinity : 0,
            repeatType: 'loop',
          }}
        />
      ))}
    </div>
  )
}

// Pulsing ring around the avatar
function PulseRing({ active, color }) {
  if (!active) return null
  return (
    <>
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-white/20"
          animate={{ scale: [1, 1.15 + i * 0.08], opacity: [0.5, 0] }}
          transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </>
  )
}

export default function Avatar3D({ avatarId, isTalking }) {
  const config = AVATAR_CONFIGS[avatarId] || AVATAR_CONFIGS.robot

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0d1220]">
      {/* Soft gradient background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-10`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />

      {/* Outer ring container */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Pulse rings */}
        <div className="relative">
          <PulseRing active={isTalking} />

          {/* Avatar circle */}
          <motion.div
            animate={
              isTalking
                ? { y: [0, -6, 0, -4, 0], scale: [1, 1.03, 1, 1.02, 1] }
                : { y: 0, scale: 1 }
            }
            transition={
              isTalking
                ? { duration: 0.5, repeat: Infinity, repeatType: 'loop' }
                : { duration: 0.4 }
            }
            className={`w-36 h-36 rounded-full bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-2xl`}
            style={{ fontSize: '5rem' }}
          >
            {config.emoji}
          </motion.div>
        </div>
      </div>

      {/* Name + sound wave badge */}
      <div className="flex flex-col items-center gap-2">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-5 py-2.5 flex items-center gap-3">
          <SoundWave active={isTalking} />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{config.name}</p>
            <p className="text-slate-400 text-xs">AI Interviewer</p>
          </div>
        </div>

        {/* Status text */}
        <motion.p
          key={isTalking ? 'speaking' : 'idle'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs font-medium ${isTalking ? 'text-indigo-400' : 'text-slate-600'}`}
        >
          {isTalking ? '● Speaking…' : '○ Waiting for your answer'}
        </motion.p>
      </div>
    </div>
  )
}
