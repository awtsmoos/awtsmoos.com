// B"H
export class AudioNarrativeDirector {
  static build(arc = [], weather = []) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      bed: weather[index]?.state || 'rain_bed',
      foreground: beat.emotion === 'discovery' ? 'tiny_blue_spark' : beat.emotion === 'victory' ? 'warm_rain_glow' : 'breath_and_rain',
      silencePocket: beat.emotion === 'resolve',
      mixNote: beat.emotion === 'fear' ? 'drop_low_end_before_lightning' : 'keep_dialogue_above_rain'
    }));
  }
}
