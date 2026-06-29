/* B"H
Manual WebCodecs profiles: speed first, quality when summoned.
The recorder never delegates to browser recorders; it tunes the WebCodecs fire directly.
*/
export const DEFAULT_PROFILE_ID = 'speed-vp8';
export const MANUAL_RECORDING_PROFILES = [
  { id:'speed-vp8', label:'Speed · VP8 realtime', codec:'vp8', muxCodec:'V_VP8', mimeCodec:'vp8', bitrateScale:1.15, latencyMode:'realtime', maxQueue:2, keyFrameSeconds:2, audioBitrate:160000 },
  { id:'balanced-vp9', label:'Balanced · VP9 realtime', codec:'vp09.00.10.08', muxCodec:'V_VP9', mimeCodec:'vp9', bitrateScale:1.7, latencyMode:'realtime', maxQueue:2, keyFrameSeconds:3, audioBitrate:160000 },
  { id:'quality-vp9', label:'Quality · VP9', codec:'vp09.00.10.08', muxCodec:'V_VP9', mimeCodec:'vp9', bitrateScale:2.6, latencyMode:'quality', maxQueue:4, keyFrameSeconds:4, audioBitrate:192000 }
];

export function profileOptionsHtml(profiles = MANUAL_RECORDING_PROFILES) {
  return profiles.map(profile => `<option value="${profile.id}">${profile.label}</option>`).join('');
}

export function getRecordingProfile(id = DEFAULT_PROFILE_ID) {
  return MANUAL_RECORDING_PROFILES.find(profile => profile.id === id) || MANUAL_RECORDING_PROFILES[0];
}

export function bitrateForProfile({ width, height, fps }, profile) {
  const pixelsPerSecond = Number(width || 1280) * Number(height || 720) * Number(fps || 30);
  return Math.max(900000, Math.round(pixelsPerSecond * (profile?.bitrateScale || 1.15) / 18));
}

export function profileSummary(profile) {
  return `${profile.label}, ${profile.mimeCodec.toUpperCase()}, queue ≤ ${profile.maxQueue}`;
}
