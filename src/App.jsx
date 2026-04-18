import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useInterviewStore from './store/useInterviewStore'

// 일반 페이지는 즉시 로드
import Landing from './pages/Landing'
import AvatarSelect from './pages/AvatarSelect'
import InterviewSetup from './pages/InterviewSetup'
import Results from './pages/Results'

// Three.js가 필요한 페이지만 lazy load (초기 로딩 에러 방지)
const InterviewRoom = lazy(() => import('./pages/InterviewRoom'))

const TRANSITION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: 'easeInOut' },
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
      <div className="spinner-lg" />
    </div>
  )
}

export default function App() {
  const phase = useInterviewStore((s) => s.phase)

  return (
    <AnimatePresence mode="wait">
      {phase === 'landing' && (
        <motion.div key="landing" {...TRANSITION}>
          <Landing />
        </motion.div>
      )}

      {phase === 'avatar' && (
        <motion.div key="avatar" {...TRANSITION}>
          <AvatarSelect />
        </motion.div>
      )}

      {phase === 'setup' && (
        <motion.div key="setup" {...TRANSITION}>
          <InterviewSetup />
        </motion.div>
      )}

      {phase === 'interview' && (
        <motion.div key="interview" {...TRANSITION}>
          <Suspense fallback={<PageLoader />}>
            <InterviewRoom />
          </Suspense>
        </motion.div>
      )}

      {phase === 'results' && (
        <motion.div key="results" {...TRANSITION}>
          <Results />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
