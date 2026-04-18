/**
 * AI service — powered by Google Gemini + browser speechSynthesis (free TTS)
 * Filename kept as openai.js so no import paths need changing.
 */
import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null

// ── Init ─────────────────────────────────────────────────────────────────────
export const initOpenAI = (apiKey) => {
  genAI = new GoogleGenerativeAI(apiKey)
}

// ── Constants ────────────────────────────────────────────────────────────────
const ROLE_LABELS = {
  behavioral: 'General Professional',
  pm:         'Product Manager',
  swe:        'Software Engineer',
  marketing:  'Marketing Manager',
  design:     'UX/Product Designer',
}

const DIFFICULTY_NOTES = {
  beginner:     'Ask entry-level questions for someone with 0–2 years of experience.',
  intermediate: 'Ask mid-level questions for someone with 3–5 years of experience.',
  senior:       'Ask senior-level questions that probe leadership, strategy, and architecture.',
}

// ── Build Gemini chat history from Q&A log ───────────────────────────────────
// Gemini history format: alternating user / model turns
// Pattern: user("Begin") → model(Q1) → user(A1) → model(Q2) → user(A2) …
//
// For question N we build history up to the LAST answer, then sendMessage(lastAnswer)
// so Gemini responds with question N+1.
const buildHistory = (qaLog) => {
  // history must start with user and strictly alternate
  const history = [
    { role: 'user', parts: [{ text: "Let's begin the interview." }] },
  ]

  // All Q&A EXCEPT the last one go into history
  const allButLast = qaLog.slice(0, -1)
  for (const qa of allButLast) {
    history.push({ role: 'model', parts: [{ text: qa.question }] })
    history.push({ role: 'user',  parts: [{ text: qa.answer   }] })
  }

  // The last question goes in as a model turn (we're about to send the last answer)
  if (qaLog.length > 0) {
    history.push({ role: 'model', parts: [{ text: qaLog[qaLog.length - 1].question }] })
  }

  return history
}

// ── Generate next interview question ─────────────────────────────────────────
export const generateNextQuestion = async ({
  qaLog,
  interviewType,
  jobRole,
  difficulty,
  questionIndex,
  totalQuestions,
}) => {
  if (!genAI) throw new Error('Gemini not initialized. Check your API key.')

  const roleLabel = jobRole || ROLE_LABELS[interviewType] || 'Professional'

  let positionNote = `You are asking question ${questionIndex + 1} of ${totalQuestions}.`
  if (questionIndex === 0) {
    positionNote = `This is the FIRST question. Warmly greet the candidate as Emma, then ask them to introduce themselves and share what excites them about this opportunity.`
  } else if (questionIndex >= totalQuestions - 1) {
    positionNote = `This is the LAST question (${questionIndex + 1}/${totalQuestions}). Ask one strong closing question, then warmly thank the candidate and say you will share detailed feedback shortly.`
  }

  const systemInstruction = `You are Emma, a warm but professional AI interviewer conducting a ${
    interviewType === 'behavioral' ? 'behavioral' : 'role-specific'
  } interview for a ${roleLabel} position.

${DIFFICULTY_NOTES[difficulty] || DIFFICULTY_NOTES.intermediate}

Rules:
- Ask EXACTLY ONE question per turn — never two questions at once
- Briefly acknowledge the candidate's previous answer before asking the next question
- For behavioral questions expect STAR format (Situation, Task, Action, Result)
- Be human and encouraging, not robotic
- Output ONLY the question text (and optional 1-sentence acknowledgement). No meta-commentary.

${positionNote}`

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction,
    })

    let result

    if (questionIndex === 0) {
      // First question — no history yet
      const chat = model.startChat({
        generationConfig: { maxOutputTokens: 280, temperature: 0.75 },
      })
      result = await chat.sendMessage("Begin the interview now.")
    } else {
      // Subsequent questions — rebuild conversation from qaLog
      const history = buildHistory(qaLog)
      const chat = model.startChat({
        history,
        generationConfig: { maxOutputTokens: 280, temperature: 0.75 },
      })
      // Send the last answer → Gemini replies with next question
      result = await chat.sendMessage(qaLog[qaLog.length - 1].answer)
    }

    return result.response.text().trim()
  } catch (err) {
    console.error('[generateNextQuestion] Gemini error:', err?.message || err)
    throw err
  }
}

// ── Text-to-Speech via browser speechSynthesis (free, no API needed) ─────────
let preferredVoice = null

const loadVoice = () =>
  new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) return resolve(voices)
    window.speechSynthesis.onvoiceschanged = () =>
      resolve(window.speechSynthesis.getVoices())
  })

export const textToSpeech = async (text) => {
  window.speechSynthesis.cancel() // stop any ongoing speech

  const voices = await loadVoice()

  if (!preferredVoice) {
    // Pick the best available English female voice
    preferredVoice =
      voices.find((v) => v.name === 'Samantha') ||                        // macOS
      voices.find((v) => v.name.includes('Google US English')) ||         // Chrome
      voices.find((v) => v.name.includes('Microsoft Aria')) ||            // Edge
      voices.find((v) => v.lang === 'en-US' && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices[0]
  }

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice  = preferredVoice
    utterance.rate   = 0.92
    utterance.pitch  = 1.05
    utterance.volume = 1.0
    utterance.lang   = 'en-US'
    utterance.onend  = resolve
    utterance.onerror = (e) => {
      // 'interrupted' happens when we cancel intentionally — treat as OK
      if (e.error === 'interrupted') return resolve()
      reject(e)
    }
    window.speechSynthesis.speak(utterance)
  })
}

export const stopSpeech = () => window.speechSynthesis?.cancel()

// ── Evaluate full interview ───────────────────────────────────────────────────
export const evaluateInterview = async (qaLog, config) => {
  if (!genAI) throw new Error('Gemini not initialized.')

  const { interviewType, jobRole, difficulty } = config
  const roleLabel  = jobRole || ROLE_LABELS[interviewType] || 'Professional'
  const transcript = qaLog
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n')

  const prompt = `You are a senior interview coach. Evaluate this ${interviewType} interview for a ${roleLabel} position (${difficulty} level).

Transcript:
${transcript}

Return ONLY valid JSON (no markdown fences) matching this exact structure:
{
  "overallScore": 78,
  "overallGrade": "B+",
  "recommendation": "Promising Candidate",
  "summary": "2-3 sentence overall assessment.",
  "breakdown": { "communication": 80, "relevance": 75, "structure": 78, "depth": 72 },
  "strengths":    ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "questionFeedback": [
    { "question": "...", "answer": "...", "score": 80, "feedback": "1-2 sentence feedback." }
  ]
}
"recommendation" must be one of: "Strong Candidate", "Promising Candidate", "Needs Development".`

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })
    const result = await model.generateContent(prompt)
    return JSON.parse(result.response.text())
  } catch (err) {
    console.error('[evaluateInterview] error:', err?.message || err)
    throw err
  }
}
