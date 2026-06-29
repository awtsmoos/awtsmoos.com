/* B"H
Codec probe: ask the browser gates directly; never pretend a codec is ready.
*/
import { createProfileRegistry, describeProfileSupport } from './profileRegistry.js';
export async function probeRecordingProfiles({ width = 1280, height = 720, fps = 30, bitrate = 2_500_000 } = {}) {
  const profiles = createProfileRegistry();
  const results = [];
  for (const profile of profiles) results.push(await probeOne(profile, { width, height, fps, bitrate }));
  return results;
}
async function probeOne(profile, video) {
  if (!globalThis.VideoEncoder?.isConfigSupported) return describeProfileSupport(profile, { supported:false, reason:'VideoEncoder unavailable' });
  try {
    const requested = { codec:profile.codec, width:video.width, height:video.height, framerate:video.fps, bitrate:video.bitrate, latencyMode:profile.latencyMode, hardwareAcceleration:'prefer-hardware' };
    const support = await VideoEncoder.isConfigSupported(requested);
    return { ...describeProfileSupport(profile, { supported:support.supported }), config:support.config || requested };
  } catch (error) {
    return describeProfileSupport(profile, { supported:false, reason:error?.message || String(error) });
  }
}
