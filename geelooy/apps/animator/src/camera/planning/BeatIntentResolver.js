// B"H
export class BeatIntentResolver {
  static resolve(e = {}) {
    const explicit = `${e.shotIntent || ''} ${e.beatType || ''}`;
    const t = `${explicit} ${e.action || ''} ${e.interaction?.type || ''}`;
    if (/reaction/i.test(explicit)) return 'reaction';
    if (/food|object|insert|bite|handoff/i.test(t) || e.prop || e.objectTarget) return 'foodAction';
    if (/dialogue/i.test(explicit) || e.speaker || e.listener || e.text || e.speech) return 'dialogue';
    if (/group|celebrate/i.test(t)) return 'group';
    if (/comedy/i.test(t)) return 'comedy';
    if (e.emotion || e.moment || /emotion|surprise/i.test(t)) return 'emotion';
    return e.shotIntent || 'group';
  }
}
