/* B"H
Profile registry: the dropdown can ask what is alive before promising it.
*/
import { MANUAL_RECORDING_PROFILES } from '../manualRecordingProfile.js';
import { estimateVideoBitrate } from './bitrateModel.js';
import { qualityScore, speedScore } from './qualityModel.js';
export function createProfileRegistry(profiles = MANUAL_RECORDING_PROFILES) {
  return profiles.map(profile => ({ ...profile, qualityScore:qualityScore(profile), speedScore:speedScore(profile) }));
}
export function describeProfileSupport(profile, support = {}) {
  const ok = support.supported !== false;
  return { id:profile.id, label:profile.label, supported:ok, reason:ok ? 'supported or unprobed' : support.reason || 'not supported', bitrate:estimateVideoBitrate({ scale:profile.bitrateScale }) };
}
export function chooseFastestSupported(entries = []) {
  return entries.filter(e => e.supported !== false).sort((a,b) => (b.speedScore || 0) - (a.speedScore || 0))[0] || null;
}
