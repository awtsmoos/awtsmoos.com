/* B"H
Audio encoder factory: build Opus configs only after the browser confirms the gate.
*/
import { getOpusProfile } from './opusProfiles.js';
export async function createSupportedOpusConfig({ sampleRate = 48000, profileId = 'standard' } = {}) {
  const profile = getOpusProfile(profileId);
  if (!globalThis.AudioEncoder?.isConfigSupported) return null;
  const requested = { codec:'opus', sampleRate, numberOfChannels:profile.numberOfChannels, bitrate:profile.bitrate };
  const support = await AudioEncoder.isConfigSupported(requested);
  return support.supported ? support.config : null;
}
