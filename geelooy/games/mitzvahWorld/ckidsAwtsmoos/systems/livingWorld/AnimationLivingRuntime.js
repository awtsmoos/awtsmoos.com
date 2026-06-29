// B"H
/**
 * AnimationLivingRuntime
 * File-by-file implementation of animation living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'animation', id, action, detail });
  return rememberLivingWorld('animation', id, { action, detail });
}
export function applyAnimationSignal(id = 'animation', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function animationSnapshot(state = {}) { return state['animation'] || livingWorldBucket('animation'); }
export function stepAnimationLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = animationSnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function microExpressions(id = 'micro_expressions', detail = {}) { return write(id, 'micro_expressions', detail); }
export function eyeContact(id = 'eye_contact', detail = {}) { return write(id, 'eye_contact', detail); }
export function idleTalks(id = 'idle_talks', detail = {}) { return write(id, 'idle_talks', detail); }
export function weightShift(id = 'weight_shift', detail = {}) { return write(id, 'weight_shift', detail); }
export function adaptiveGait(id = 'adaptive_gait', detail = {}) { return write(id, 'adaptive_gait', detail); }
export function reaching(id = 'reaching', detail = {}) { return write(id, 'reaching', detail); }
export function gestures(id = 'gestures', detail = {}) { return write(id, 'gestures', detail); }
export function childMotion(id = 'child_motion', detail = {}) { return write(id, 'child_motion', detail); }
export function elderMotion(id = 'elder_motion', detail = {}) { return write(id, 'elder_motion', detail); }
export function emotionBlending(id = 'emotion_blending', detail = {}) { return write(id, 'emotion_blending', detail); }
export function prayerSway(id = 'prayer_sway', detail = {}) { return write(id, 'prayer_sway', detail); }
export function learningPosture(id = 'learning_posture', detail = {}) { return write(id, 'learning_posture', detail); }
export default { applyAnimationSignal, animationSnapshot, stepAnimationLivingWorld, microExpressions, eyeContact, idleTalks, weightShift, adaptiveGait, reaching, gestures, childMotion, elderMotion, emotionBlending, prayerSway, learningPosture };
