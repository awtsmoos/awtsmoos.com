/* B"H
Before bytes are born, ask the browser which vessels it can truly hold.
*/
export function createExportPlan(state) {
  return { engine:'WebCodecs', videoCodec:'avc1.42E01E', audioCodec:'mp4a.40.2', container:'MP4 or MPEG-TS HLS', width:state.width, height:state.height, fps:state.fps, status:'planned', probe:null };
}
export function describeExport(plan) {
  const probe = plan.probe ? ` | probe: video ${word(plan.probe.video)}, audio ${word(plan.probe.audio)}` : '';
  return `${plan.engine}: ${plan.videoCodec} + ${plan.audioCodec}, ${plan.width}×${plan.height}@${plan.fps}, ${plan.container}${probe}`;
}
export async function probeWebCodecsExport(plan) {
  const video = await probeVideo(plan); const audio = await probeAudio(plan);
  plan.probe = { video:video.ok, audio:audio.ok, videoDetail:video.detail, audioDetail:audio.detail, at:Date.now() };
  plan.status = video.ok && audio.ok ? 'webcodecs-ready' : 'webcodecs-limited'; return plan.probe;
}
async function probeVideo(plan) {
  if (!globalThis.VideoEncoder?.isConfigSupported) return { ok:false, detail:'VideoEncoder unavailable' };
  try { const r = await VideoEncoder.isConfigSupported({ codec:plan.videoCodec, width:plan.width, height:plan.height, bitrate:4_000_000, framerate:plan.fps }); return { ok:!!r.supported, detail:r.config?.codec || plan.videoCodec }; } catch (e) { return { ok:false, detail:e.message }; }
}
async function probeAudio(plan) {
  if (!globalThis.AudioEncoder?.isConfigSupported) return { ok:false, detail:'AudioEncoder unavailable' };
  try { const r = await AudioEncoder.isConfigSupported({ codec:plan.audioCodec, sampleRate:48000, numberOfChannels:2, bitrate:128000 }); return { ok:!!r.supported, detail:r.config?.codec || plan.audioCodec }; } catch (e) { return { ok:false, detail:e.message }; }
}
function word(ok) { return ok ? 'supported' : 'limited'; }
