export function useSounds(urls) {
  const sounds = Object.fromEntries(
    Object.entries(urls).map(([key, url]) => [key, url ? new Audio(url) : null])
  )

  const play = (audio) => {
    if (!audio) return
    audio.currentTime = 0
    audio.volume = 0.6
    audio.play().catch(() => {})
  }

  return {
    playClick: () => play(sounds.click),
    playGood: () => play(sounds.good),
    playBad: () => play(sounds.bad),
    playStart: () => play(sounds.start)
  }
}
