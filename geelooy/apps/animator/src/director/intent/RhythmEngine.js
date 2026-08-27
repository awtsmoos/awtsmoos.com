// B"H
export class RhythmEngine {
  static build(arc = []) {
    const pulses = ['linger', 'tighten', 'burst', 'pause', 'gather', 'release'];
    return arc.map((beat, i) => ({ at: beat.at ?? i * 2000, pulse: pulses[i % pulses.length], silenceWeight: beat.emotion === 'resolve' ? .8 : .35, cutEnergy: i < 3 ? .54 : .28, breath: i % 2 ? 'inhale' : 'exhale' }));
  }
}
