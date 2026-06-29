// B"H
export class EnvironmentalMemoryEngine {
  static build(arc = []) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      footprints: index * 3,
      puddleSpread: Math.min(1, .18 + index * .13),
      flagSaturation: Math.min(1, .42 + index * .08),
      debrisDrift: index < 4 ? 'windward' : 'settling',
      memory: `${beat.emotion}_left_marks_on_plaza`
    }));
  }
}
