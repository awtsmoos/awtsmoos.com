// B"H
import { StrideDisplacementSolver } from '../../../../character/animation/gait/StrideDisplacementSolver.js';
import { FacePerformanceEngine } from '../../../../performance/face/FacePerformanceEngine.js';
import { AttentionEngine } from '../../../../performance/attention/AttentionEngine.js';
import { BodyPerformanceEngine } from '../../../../performance/body/BodyPerformanceEngine.js';

/** Character events now merge performance state while preserving renderer identity. */
export class CharacterProcessor {
  static process(state, event = {}, t = 0, elapsed = 0) {
    const characters = state.get('characters') || {};
    const id = event.id || event.actor || event.target;
    const current = characters[id];
    if (!current) return;
    const next = this.cloneCharacter(current);
    const progress = this.ease(t);
    this.applyTravel(next, event, progress);
    this.applyLayerFields(next, event);
    this.applyPerformance(next, event, progress, elapsed);
    this.applyTimedActions(next, event, progress);
    this.applyDefaults(next, event, progress);
    state.set('characters', { ...characters, [id]: next }, true);
  }

  static cloneCharacter(current = {}) { return { ...current, position: { ...(current.position || {}) } }; }

  static applyTravel(next, event = {}, t = 0) {
    if (!event.pos?.from || !event.pos?.to) { next._travelProgress = 0; return; }
    const oldX = Number(next.position.x || event.pos.from.x || 0);
    const sampled = StrideDisplacementSolver.sample(event.pos.from, event.pos.to, t);
    next.position = { ...next.position, ...sampled };
    const newX = Number(next.position.x || 0);
    next._travelDirection = newX === oldX ? next._travelDirection || 1 : newX > oldX ? 1 : -1;
    next.locomotion = event.locomotion || event.action || 'walk';
    next.motionMode = 'worldTravel';
    next.acting = next.locomotion;
    next._travelProgress = t;
    next.directorTime = Number(event.start || 0) + (Number(event.end || 0) - Number(event.start || 0)) * t;
    if (!event.view) { next.view = Math.abs(newX - oldX) > 8 ? 'side' : next.view || 'threeQuarter'; next.flipX = next._travelDirection < 0; }
  }

  static applyLayerFields(next, event = {}) {
    for (const field of this.layerFields) if (Object.prototype.hasOwnProperty.call(event, field)) next[field] = event[field];
    if (event.acting) this.applyActing(next, event.acting);
  }

  static applyPerformance(next, event = {}, t = 0, elapsed = 0) {
    const time = Number(elapsed || event.start || 0) + t * Math.max(500, Number(event.end || 0) - Number(event.start || 0));
    const attention = AttentionEngine.compose({ character: next, event, time, emphasis: next.speechEmphasis || 0 });
    if (event.performance !== false) {
      next.attentionTarget = attention.target || next.attentionTarget;
      next.blinkNow = attention.blink;
      next.eyeDart = attention.dart;
      next.facePose = event.facePose || next.facePose || FacePerformanceEngine.compose({ emotion: event.emotion || next.emotion, moment: event.moment, progress: t, profile: next.expressionProfile, attention: attention.target, blink: attention.blink, dart: attention.dart });
      next.performancePose = event.performancePose || BodyPerformanceEngine.compose({ time, progress: t, energy: next.speechEmphasis || 0.85, gesture: event.gesture || next.gesture, speech: next.speech });
      next.breathMotion = next.performancePose.breath;
      next.weightShift = next.performancePose.weight;
      next.headTilt = next.performancePose.headTilt;
      next.headNod = next.headNod ?? next.performancePose.headNod;
    }
  }

  static applyTimedActions(next, event = {}, t = 0) {
    if (!Array.isArray(event.actions)) return;
    for (const action of event.actions) {
      if (t < Number(action.at || 0) || !action.key) continue;
      if (action.key === 'acting') { this.applyActing(next, action.value); continue; }
      if (action.key === 'position' && action.value) { next.position = { ...next.position, ...action.value }; continue; }
      next[action.key] = action.value;
    }
  }

  static applyActing(next, value) { if (value === 'walk' || value === 'run') next.locomotion = value; else next.gesture = value; next.acting = value; }

  static applyDefaults(next, event = {}, t = 0) {
    if (next.locomotion === 'walk' || next.locomotion === 'run') next.motionMode = 'worldTravel';
    if (!next.view) next.view = event.view || 'threeQuarter';
    if (!next.gesture) next.gesture = 'none';
    if (!next.emotion) next.emotion = 'calm';
    if (!Number.isFinite(next._travelProgress)) next._travelProgress = t;
  }

  static ease(t) { return Math.max(0, Math.min(1, Number(t) || 0)); }

  static layerFields = ['locomotion', 'gesture', 'upperBody', 'speechStyle', 'speechEnergy', 'emotion', 'lookAt', 'attentionTarget', 'facingMode', 'view', 'flipX', 'heldPropId', 'propAction', 'bodyProfile', 'lineStyle', 'motionMode', 'facePose', 'performancePose', 'expressionProfile', 'styleProfile', 'actingPersonality'];
}
