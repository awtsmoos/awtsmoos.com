// B"H
export class MicroExpressionTimeline {
  static build(characters = {}, arc = []) {
    return Object.fromEntries(Object.keys(characters).map(id => [id, arc.flatMap((beat, i) => this.marks(id, beat, i))]));
  }
  static marks(id, beat, index) {
    const at = beat.at ?? index * 2000;
    return [
      { at: at + 120, face: 'blink_hold', intensity: beat.emotion === 'fear' ? .8 : .35, reason: `${id}_${beat.emotion}_first_reaction` },
      { at: at + 520, face: beat.emotion === 'victory' ? 'relieved_half_smile' : 'jaw_tension_release', intensity: .56, reason: 'micro_truth_between_words' },
      { at: at + 900, face: 'eye_dart_return', intensity: .44, reason: 'attention_reconnects' }
    ];
  }
}
