// B"H
export class DirectorNotesEngine {
  static build(arc = []) {
    return arc.map((beat, i) => ({
      at: beat.at ?? i * 2000, emotion: beat.emotion,
      note: beat.note || this.noteFor(beat.emotion),
      forbid: beat.emotion === 'resolve' ? ['cheapBlink', 'randomCamera'] : ['emptyMotion'],
      mustHold: beat.emotion === 'fear' ? 'breathUntilLightning' : 'eyeLineIntent'
    }));
  }
  static noteFor(emotion) {
    return ({ doubt: 'Let the silence ask before the mouth answers.', fear: 'Eyes search for shelter before the body moves.', discovery: 'Do not rush the spark.', resolve: 'Hands become a roof.', victory: 'The storm remains, but it is no longer lonely.' })[emotion] || 'Protect intent.';
  }
}
