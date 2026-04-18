// Web Speech API wrapper — Chrome/Edge only

class SpeechRecognitionService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.fullTranscript = ''
    this.onUpdate = null   // (interim text) => void
    this.onEnd = null      // (final text) => void
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }

  init() {
    if (!this.isSupported()) {
      throw new Error('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SR()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    this.recognition.maxAlternatives = 1

    this.recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += t + ' '
        } else {
          interim += t
        }
      }

      if (final) this.fullTranscript += final
      if (this.onUpdate) this.onUpdate(this.fullTranscript + interim)
    }

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error)
      if (event.error === 'no-speech') return // ignore silence
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.onEnd) this.onEnd(this.fullTranscript.trim())
    }
  }

  start(onUpdate, onEnd) {
    this.fullTranscript = ''
    this.onUpdate = onUpdate
    this.onEnd = onEnd

    if (!this.recognition) this.init()

    // Re-init if ended
    try {
      this.recognition.start()
      this.isListening = true
    } catch (e) {
      this.init()
      this.recognition.start()
      this.isListening = true
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  abort() {
    if (this.recognition) {
      this.recognition.abort()
      this.isListening = false
    }
  }
}

export const speechService = new SpeechRecognitionService()
