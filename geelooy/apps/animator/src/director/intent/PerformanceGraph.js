// B"H
const BODY = {
  doubt: ['smallBreath', 'inwardShoulders', 'searchingHands'], fear: ['heldBreath', 'tightHands', 'weightBack'],
  discovery: ['breathCatch', 'forwardLean', 'handsFreeze'], resolve: ['slowExhale', 'steadyHands', 'weightForward'],
  victory: ['openBreath', 'liftedChest', 'sharedSmile']
};

export class PerformanceGraph {
  static build(characters = {}, arc = []) {
    return Object.fromEntries(Object.keys(characters).map(id => [id, this.track(id, arc)]));
  }
  static track(id, arc) {
    return arc.map((beat, i) => ({ at: beat.at ?? i * 2000, emotion: beat.emotion, body: BODY[beat.emotion] || BODY.resolve, eyes: beat.look || 'storyFocus', breath: (BODY[beat.emotion] || BODY.resolve)[0], characterId: id }));
  }
}
