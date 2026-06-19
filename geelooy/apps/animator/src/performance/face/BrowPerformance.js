// B"H
export class BrowPerformance {
  static fromSpeech(progress = 0, energy = 1) { return { innerRaise: 0.08 * energy, outerRaise: Math.sin(progress * Math.PI * 3) * 0.08 * energy, squeeze: 0 }; }
}
