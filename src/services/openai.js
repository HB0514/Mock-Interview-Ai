import OpenAI from 'openai'

let client = null

export const initOpenAI = (apiKey) => {
  client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
}

const ROLE_LABELS = {
  behavioral: 'General Professional',
  pm: 'Product Manager',
  swe: 'Software Engineer',
  marketing: 'Marketing Manager',
  design: 'UX/Product Designer',
}

const DIFFICULTY_NOTES = {
  beginner: 'Ask entry-level questions appropriate for someone with 0-2 years experience.',
  intermediate: 'Ask mid-level questions appropriate for someone with 3-5 years experience.',
  senior: 'Ask senior-level questions that probe leadership, architecture decisions, and strategic thinking.',
}

export const buildSystemPrompt = (config) => {
  const { interviewType, jobRole, difficulty } = config
  const roleLabel = jobRole || ROLE_LABELS[interviewType] || 'Professional'

  return `You are Emma, a warm but professional AI interviewer conducting a ${interviewType === 'behavioral' ? 'behavioral' : 'role-specific'} interview for a ${roleLabel} position.

${DIFFICULTY_NOTES[difficulty] || DIFFICULTY_NOTES.intermediate}

Your style:
- Ask ONE focused question at a time — never multiple questions in one message
- Be encouraging and human-sounding, not robotic
- For behavioral questions, expect STAR format answers (Situation, Task, Action, Result)
- Acknowledge the candidate's previous answer briefly before asking the next question
- Vary question types: past experience, hypothetical scenarios, self-reflection

CRITICAL: Your response must be ONLY the question or acknowledgement + question. No preambles like "Great question!" or "That's a good point" repeatedly. Keep it natural and varied.`
}

export const generateNextQuestion = async ({
  messages,
  interviewType,
  jobRole,
  difficulty,
  questionIndex,
  totalQuestions,
}) => {
  if (!client) throw new Error('OpenAI not initialized')

  const isFirst = questionIndex === 0
  const isLast = questionIndex >= totalQuestions - 1

  let userPrompt = ''
  if (isFirst) {
    userPrompt = 'Start the interview. Introduce yourself briefly as Emma the AI interviewer, then ask the candidate to introduce themselves and share what makes them excited about this role.'
  } else if (isLast) {
    userPrompt = `This is the final question (${questionIndex + 1}/${totalQuestions}). Ask a strong closing question, then thank the candidate warmly and let them know you will provide feedback shortly.`
  } else {
    userPrompt = `Ask question ${questionIndex + 1} of ${totalQuestions}. Briefly acknowledge their previous answer, then ask the next relevant question.`
  }

  const systemPrompt = buildSystemPrompt({ interviewType, jobRole, difficulty })

  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 220,
    temperature: 0.75,
  })

  return res.choices[0].message.content.trim()
}

export const textToSpeech = async (text) => {
  if (!client) throw new Error('OpenAI not initialized')

  const response = await client.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
    speed: 1.0,
  })

  const buffer = await response.arrayBuffer()
  const blob = new Blob([buffer], { type: 'audio/mpeg' })
  return URL.createObjectURL(blob)
}

export const evaluateInterview = async (qaLog, config) => {
  if (!client) throw new Error('OpenAI not initialized')

  const { interviewType, jobRole, difficulty } = config
  const roleLabel = jobRole || ROLE_LABELS[interviewType] || 'Professional'
  const transcript = qaLog
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n')

  const systemPrompt = `You are a senior interview coach. Evaluate this ${interviewType} interview for a ${roleLabel} position (${difficulty} level).

Return ONLY valid JSON in this exact structure:
{
  "overallScore": 78,
  "overallGrade": "B+",
  "recommendation": "Strong Candidate",
  "summary": "2-3 sentence overall assessment",
  "breakdown": {
    "communication": 80,
    "relevance": 75,
    "structure": 78,
    "depth": 72
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "questionFeedback": [
    {
      "question": "...",
      "answer": "...",
      "score": 80,
      "feedback": "Specific 1-2 sentence feedback"
    }
  ]
}

Recommendation must be one of: "Strong Candidate", "Promising Candidate", "Needs Development"`

  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: transcript },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(res.choices[0].message.content)
}
