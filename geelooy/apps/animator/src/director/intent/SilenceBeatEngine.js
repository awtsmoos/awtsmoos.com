// B"H
export class SilenceBeatEngine {
  static build(arc = []) {
    return arc.map((beat, index) => ({
      at: (beat.at ?? index * 2000) + 640,
      duration: beat.emotion === 'resolve' ? 1100 : 520,
      reason: beat.emotion === 'resolve' ? 'let hands become the dialogue' : 'let eyes speak before words',
      focus: beat.object || beat.look || 'sharedBreath',
      sound: beat.emotion === 'victory' ? 'warmRainOnly' : 'rainAndBreath'
    }));
  }
}
