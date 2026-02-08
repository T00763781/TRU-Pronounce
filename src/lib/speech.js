export function listLocalVoices() {
  const voices = window.speechSynthesis.getVoices?.() || []
  return voices.filter(v => v.localService === true)
}

export function speak(text, voice, settings = {}) {
  if (!window.speechSynthesis) throw new Error('Web Speech API not available')
  window.speechSynthesis.cancel()

  const u = new SpeechSynthesisUtterance(text)
  if (voice) u.voice = voice
  if (typeof settings.rate === 'number') u.rate = settings.rate
  if (typeof settings.pitch === 'number') u.pitch = settings.pitch
  if (typeof settings.volume === 'number') u.volume = settings.volume
  window.speechSynthesis.speak(u)
  return u
}
