// B"H
import { FacePerformanceEngine } from '../../../../performance/face/FacePerformanceEngine.js';
import { AttentionEngine } from '../../../../performance/attention/AttentionEngine.js';
import { BodyPerformanceEngine } from '../../../../performance/body/BodyPerformanceEngine.js';

/** Speech now drives face, eyes, attention, and body acting while preserving mouth/blink/limb renderer fields. */
export class SpeechProcessor {
  static process(state, event = {}, t = 0) {
    const characters = state.get('characters') || {};
    const id = event.id || event.actor || event.speaker;
    const current = characters[id];
    if (!current) return;

    const speech = event.speech || event.text || '';
    const duration = Math.max(500, (event.end || 0) - (event.start || 0));
    const progress = Math.max(0, Math.min(1, Number(t) || 0));
    const local = Number(event.speechLocalTime ?? duration * progress);
    const emphasis = this.emphasis(progress, speech, current.speechEnergy || event.speechEnergy || 1);
    const attention = AttentionEngine.compose({ character: current, event, time: local, emphasis });
    const facePose = FacePerformanceEngine.compose({ emotion: event.emotion || current.emotion, moment: event.moment || (speech ? 'curious' : null), progress, speech, energy: emphasis, profile: current.expressionProfile, attention: attention.target, blink: attention.blink, dart: attention.dart });
    const performancePose = BodyPerformanceEngine.compose({ time: local, progress, energy: emphasis, gesture: event.gesture || current.gesture, speech });

    const next = {
      ...current,
      position: { ...(current.position || {}) },
      speech,
      isTalking: Boolean(speech),
      speechStyle: event.speechStyle || current.speechStyle || 'clear',
      speechEnergy: Number.isFinite(event.speechEnergy) ? event.speechEnergy : Number(current.speechEnergy || 1),
      speechLocalTime: local,
      speechDuration: duration,
      speechEmphasis: emphasis,
      mouthOpen: facePose.mouth.open,
      mouthSmile: facePose.mouth.smile,
      facePose,
      performancePose,
      attentionTarget: attention.target,
      blinkNow: attention.blink,
      eyeDart: attention.dart,
      gesture: event.gesture || current.gesture || 'explain',
      acting: event.acting || event.gesture || (speech ? 'talk' : current.acting || 'listen_idle'),
      upperBody: speech ? 'talking_emphasis' : current.upperBody,
      headNod: performancePose.headNod,
      headTilt: performancePose.headTilt,
      shoulderMotion: performancePose.shoulder,
      handPerformance: performancePose.hand,
      breathMotion: performancePose.breath,
      weightShift: performancePose.weight,
      emotion: event.emotion || current.emotion || 'focused',
      lookAt: event.lookAt || event.listener || current.lookAt || null,
      dialogueMode: event.dialogueMode || event.mode || current.dialogueMode || 'subtitle'
    };

    this.applyTimedSpeechActions(next, event, progress);
    state.set('characters', { ...characters, [id]: next }, true);
    state.set('activeDialogue', this.dialogue(id, next, event, progress), true);
  }

  static applyTimedSpeechActions(next, event = {}, t = 0) {
    if (!Array.isArray(event.actions)) return;
    for (const action of event.actions) {
      if (t < Number(action.at || 0) || !action.key) continue;
      if (action.key === 'acting') next.gesture = action.value;
      else next[action.key] = action.value;
    }
  }

  static dialogue(id, next, event, t) {
    return { id, speakerId: id, listenerId: event.lookAt || event.listener || null, text: next.speech, mode: next.dialogueMode, start: event.start || 0, end: event.end || 0, progress: t };
  }

  static emphasis(t, speech = '', energy = 1) {
    const wordWeight = Math.min(1.35, Math.max(0.78, String(speech).length / 42));
    return wordWeight * Number(energy || 1) * (0.78 + 0.22 * Math.sin(t * Math.PI));
  }
}
