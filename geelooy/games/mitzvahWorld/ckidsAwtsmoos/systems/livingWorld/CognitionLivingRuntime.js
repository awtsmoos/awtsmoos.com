// B"H
/**
 * CognitionLivingRuntime
 * File-by-file implementation of cognition living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'cognition', id, action, detail });
  return rememberLivingWorld('cognition', id, { action, detail });
}
export function applyCognitionSignal(id = 'cognition', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function cognitionSnapshot(state = {}) { return state['cognition'] || livingWorldBucket('cognition'); }
export function stepCognitionLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = cognitionSnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function beliefFormation(id = 'belief_formation', detail = {}) { return write(id, 'belief_formation', detail); }
export function mistakes(id = 'mistakes', detail = {}) { return write(id, 'mistakes', detail); }
export function rumorDistortion(id = 'rumor_distortion', detail = {}) { return write(id, 'rumor_distortion', detail); }
export function emotionalPlaces(id = 'emotional_places', detail = {}) { return write(id, 'emotional_places', detail); }
export function personalFears(id = 'personal_fears', detail = {}) { return write(id, 'personal_fears', detail); }
export function curiosity(id = 'curiosity', detail = {}) { return write(id, 'curiosity', detail); }
export function personalityDrift(id = 'personality_drift', detail = {}) { return write(id, 'personality_drift', detail); }
export function learningByObservation(id = 'learning_by_observation', detail = {}) { return write(id, 'learning_by_observation', detail); }
export function socialInfluence(id = 'social_influence', detail = {}) { return write(id, 'social_influence', detail); }
export function emergentTraditions(id = 'emergent_traditions', detail = {}) { return write(id, 'emergent_traditions', detail); }
export function attentionSpan(id = 'attention_span', detail = {}) { return write(id, 'attention_span', detail); }
export function trustCalibration(id = 'trust_calibration', detail = {}) { return write(id, 'trust_calibration', detail); }
export default { applyCognitionSignal, cognitionSnapshot, stepCognitionLivingWorld, beliefFormation, mistakes, rumorDistortion, emotionalPlaces, personalFears, curiosity, personalityDrift, learningByObservation, socialInfluence, emergentTraditions, attentionSpan, trustCalibration };
