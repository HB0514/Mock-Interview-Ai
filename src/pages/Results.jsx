import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, AlertCircle, ChevronDown, RotateCcw, Star } from 'lucide-react'
import useInterviewStore from '../store/useInterviewStore'

const GRADE_COLORS = {
  'A+': '#10b981', A: '#10b981', 'A-': '#34d399',
  'B+': '#6366f1', B: '#6366f1', 'B-': '#818cf8',
  'C+': '#f59e0b', C: '#f59e0b', 'C-': '#fbbf24',
  D: '#ef4444', F: '#dc2626',
}

const RECOMMENDATION_CONFIG = {
  'Strong Candidate': { color: '#10b981', emoji: '🏆' },
  'Promising Candidate': { color: '#6366f1', emoji: '⭐' },
  'Needs Development': { color: '#f59e0b', emoji: '📈' },
}

function ScoreRing({ score, label, size = 100 }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : '#f59e0b'

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e2433" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xl">{score}</span>
        </div>
      </div>
      <p className="text-slate-400 text-xs font-medium">{label}</p>
    </div>
  )
}

export default function Results() {
  const { results, userName, interviewType, jobRole, reset } = useInterviewStore()

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-slate-400">Generating your feedback…</p>
        </div>
      </div>
    )
  }

  const {
    overallScore,
    overallGrade,
    recommendation,
    summary,
    breakdown,
    strengths,
    improvements,
    questionFeedback,
  } = results

  const gradeColor = GRADE_COLORS[overallGrade] || '#6366f1'
  const recConfig = RECOMMENDATION_CONFIG[recommendation] || RECOMMENDATION_CONFIG['Promising Candidate']

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-5xl mb-3">{recConfig.emoji}</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Interview <span className="text-gradient">Complete</span>
          </h1>
          <p className="text-slate-400">
            Great job, {userName}! Here's your detailed performance review.
          </p>
        </motion.div>

        {/* Overall score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-8 mb-6 text-center"
        >
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {/* Big score ring */}
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                <svg width="144" height="144" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="58" fill="none" stroke="#1e2433" strokeWidth="10" />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="58"
                    fill="none"
                    stroke={gradeColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58}
                    animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - overallScore / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                    transform="rotate(-90 72 72)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">{overallScore}</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </div>
              </div>
              <div
                className="mt-3 text-2xl font-bold"
                style={{ color: gradeColor }}
              >
                Grade {overallGrade}
              </div>
            </div>

            {/* Recommendation */}
            <div className="text-left">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-3"
                style={{ background: `${recConfig.color}22`, color: recConfig.color }}
              >
                <Star size={14} />
                {recommendation}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xs">{summary}</p>
            </div>
          </div>
        </motion.div>

        {/* Breakdown scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-6"
        >
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Score Breakdown
          </h3>
          <div className="flex justify-around flex-wrap gap-4">
            <ScoreRing score={breakdown.communication} label="Communication" />
            <ScoreRing score={breakdown.relevance} label="Relevance" />
            <ScoreRing score={breakdown.structure} label="Structure" />
            <ScoreRing score={breakdown.depth} label="Depth" />
          </div>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
              <Trophy size={16} /> Top Strengths
            </h3>
            <ul className="space-y-2">
              {strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card p-6"
          >
            <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={16} /> Areas to Improve
            </h3>
            <ul className="space-y-2">
              {improvements?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-amber-400 mt-0.5">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Per-question feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-white font-semibold mb-5">Question-by-Question Review</h3>
          <div className="space-y-4">
            {questionFeedback?.map((qf, i) => {
              const color = qf.score >= 80 ? '#10b981' : qf.score >= 60 ? '#6366f1' : '#f59e0b'
              return (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors list-none">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ background: `${color}22`, color }}
                      >
                        {qf.score}
                      </div>
                      <span className="text-slate-300 text-sm font-medium line-clamp-1">
                        Q{i + 1}: {qf.question?.slice(0, 60)}…
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>

                  <div className="mt-2 pl-11 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Your Answer</p>
                      <p className="text-slate-300 text-sm bg-white/5 rounded-lg p-3 leading-relaxed">
                        {qf.answer || '(No answer)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Feedback</p>
                      <p className="text-sm leading-relaxed" style={{ color }}>
                        {qf.feedback}
                      </p>
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary flex items-center gap-2"
          >
            <RotateCcw size={16} /> Start New Interview
          </button>
        </div>
      </div>
    </div>
  )
}
