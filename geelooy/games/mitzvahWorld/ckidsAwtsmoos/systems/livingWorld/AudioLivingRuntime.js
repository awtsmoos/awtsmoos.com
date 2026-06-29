// B"H
/**
 * AudioLivingRuntime
 * File-by-file implementation of audio living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'audio', id, action, detail });
  return rememberLivingWorld('audio', id, { action, detail });
}
export function applyAudioSignal(id = 'audio', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function audioSnapshot(state = {}) { return state['audio'] || livingWorldBucket('audio'); }
export function stepAudioLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = audioSnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function positionalTalk(id = 'positional_talk', detail = {}) { return write(id, 'positional_talk', detail); }
export function echo(id = 'echo', detail = {}) { return write(id, 'echo', detail); }
export function windTrees(id = 'wind_trees', detail = {}) { return write(id, 'wind_trees', detail); }
export function ambienceLayers(id = 'ambience_layers', detail = {}) { return write(id, 'ambience_layers', detail); }
export function indoorAcoustics(id = 'indoor_acoustics', detail = {}) { return write(id, 'indoor_acoustics', detail); }
export function footstepMaterials(id = 'footstep_materials', detail = {}) { return write(id, 'footstep_materials', detail); }
export function crowdMurmur(id = 'crowd_murmur', detail = {}) { return write(id, 'crowd_murmur', detail); }
export function animalCalls(id = 'animal_calls', detail = {}) { return write(id, 'animal_calls', detail); }
export function musicMotifs(id = 'music_motifs', detail = {}) { return write(id, 'music_motifs', detail); }
export function prayerAcoustics(id = 'prayer_acoustics', detail = {}) { return write(id, 'prayer_acoustics', detail); }
export function marketCalls(id = 'market_calls', detail = {}) { return write(id, 'market_calls', detail); }
export function distantBells(id = 'distant_bells', detail = {}) { return write(id, 'distant_bells', detail); }
export default { applyAudioSignal, audioSnapshot, stepAudioLivingWorld, positionalTalk, echo, windTrees, ambienceLayers, indoorAcoustics, footstepMaterials, crowdMurmur, animalCalls, musicMotifs, prayerAcoustics, marketCalls, distantBells };
