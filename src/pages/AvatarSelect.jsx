import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RefreshCw, User } from 'lucide-react'
import useInterviewStore from '../store/useInterviewStore'

const RPM_URL =
  'https://demo.readyplayer.me/avatar?frameApi&clearCache&quickStart=false&bodyType=halfbody'

export default function AvatarSelect() {
  const iframeRef = useRef(null)
  const [avatarUrl, setAvatarUrlLocal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmed, setConfirmed] = useState(false)

  const { setAvatarUrl, setPhase, userName } = useInterviewStore()

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.data &&
        event.data.source === 'readyplayerme' &&
        event.data.eventName === 'v1.avatar.exported'
      ) {
        const url = event.data.data?.url
        if (url) {
          setAvatarUrlLocal(url)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleConfirm = () => {
    setAvatarUrl(avatarUrl)
    setPhase('setup')
  }

  const handleSkip = () => {
    // Use a default public RPM avatar
    setAvatarUrl(
      'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb'
    )
    setPhase('setup')
  }

  const handleReset = () => {
    setAvatarUrlLocal(null)
    setLoading(true)
    if (iframeRef.current) {
      iframeRef.current.src = RPM_URL
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-6">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Choose Your <span className="text-gradient">AI Interviewer</span>
          </h2>
          <p className="text-slate-400">
            Customize the avatar that will interview you today, {userName}
          </p>
        </div>

        <div className="glass-card p-4 relative overflow-hidden" style={{ height: 520 }}>
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900 z-10 rounded-xl">
              <div className="spinner-lg mb-4" />
              <p className="text-slate-400 text-sm">Loading avatar creator…</p>
            </div>
          )}

          {/* RPM Iframe */}
          {!avatarUrl && (
            <iframe
              ref={iframeRef}
              src={RPM_URL}
              title="Ready Player Me Avatar Creator"
              className="w-full h-full rounded-lg border-0"
              allow="camera *; microphone *"
              onLoad={() => setLoading(false)}
            />
          )}

          {/* Avatar Preview */}
          {avatarUrl && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full gap-6"
              >
                <div className="w-48 h-48 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <User size={80} className="text-white opacity-80" />
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-semibold mb-1">✓ Avatar created!</p>
                  <p className="text-slate-400 text-sm">Your avatar is ready for the interview</p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          {avatarUrl ? (
            <>
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={handleConfirm}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Use This Avatar <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={handleSkip}
              className="btn-secondary ml-auto flex items-center gap-2 text-sm"
            >
              Skip — Use Default Avatar
            </button>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Powered by Ready Player Me · Your avatar is loaded live in the interview
        </p>
      </motion.div>
    </div>
  )
}
