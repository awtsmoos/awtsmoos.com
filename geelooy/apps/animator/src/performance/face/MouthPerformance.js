// B"H
export class MouthPerformance {
  static fromSpeech({ progress = 0, energy = 1, speech = '' } = {}) {
    const syllables = Math.max(5, Math.min(15, String(speech).length / 5));
    const pulse = Math.abs(Math.sin(progress * Math.PI * syllables));
    return { open: Math.min(1, 0.12 + pulse * 0.72 * energy), jaw: pulse * 0.45 * energy, smile: speech.includes('!') ? 0.18 : 0 };
  }
}
