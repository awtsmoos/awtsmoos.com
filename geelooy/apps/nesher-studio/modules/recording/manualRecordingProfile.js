/* B"H
Manual WebCodecs profiles: speed first, quality when summoned.
The recorder never delegates to browser recorders; it tunes the WebCodecs fire directly.
*/
export const DEFAULT_PROFILE_ID = 'speed-vp8';
export const MANUAL_RECORDING_PROFILES = [
  { id:'speed-vp8', label:'Speed · VP8 realtime', codec:'vp8', muxCodec:'V_VP8', mimeCodec:'vp8', bitrateScale:1.45, latencyMode:'realtime', maxQueue:1, catchUpFrames:2, keyFrameSeconds:2, audioBitrate:160000 },
  { id:'balanced-vp8', label:'Balanced · VP8 crisp', codec:'vp8', muxCodec:'V_VP8', mimeCodec:'vp8', bitrateScale:2.1, latencyMode:'realtime', maxQueue:2, catchUpFrames:2, keyFrameSeconds:2, audioBitrate:192000 },
  { id:'balanced-vp9', label:'Balanced · VP9 realtime', codec:'vp09.00.10.08', muxCodec:'V_VP9', mimeCodec:'vp9', bitrateScale:2.45, latencyMode:'realtime', maxQueue:2, catchUpFrames:1, keyFrameSeconds:3, audioBitrate:192000 },
  { id:'quality-vp9', label:'Quality · VP9', codec:'vp09.00.10.08', muxCodec:'V_VP9', mimeCodec:'vp9', bitrateScale:3.4, latencyMode:'quality', maxQueue:4, catchUpFrames:1, keyFrameSeconds:4, audioBitrate:224000 }
];
export function profileOptionsHtml(profiles = MANUAL_RECORDING_PROFILES) { return profiles.map(profile => `<option value="${profile.id}">${profile.label}</option>`).join(''); }
export function getRecordingProfile(id = DEFAULT_PROFILE_ID) { return MANUAL_RECORDING_PROFILES.find(profile => profile.id === id) || MANUAL_RECORDING_PROFILES[0]; }
export function bitrateForProfile({ width, height, fps }, profile) {
  const pixelsPerSecond = Number(width || 1280) * Number(height || 720) * Number(fps || 30);
  return Math.max(1200000, Math.round(pixelsPerSecond * (profile?.bitrateScale || 1.45) / 18));
}
export function profileSummary(profile) { return `${profile.label}, ${profile.mimeCodec.toUpperCase()}, queue ≤ ${profile.maxQueue}, dequeue catch-up ${profile.catchUpFrames}`; }
