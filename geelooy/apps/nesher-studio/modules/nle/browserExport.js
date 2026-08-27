/* B"H
Tiny export vessel for Nesher NLE: render canvas frames into an MP4 preview.
It attempts silent AAC through Mediabunny when browser audio permission allows it,
but always returns honest audioStatus instead of pretending.
*/
const MEDIABUNNY_URL = 'https://esm.sh/mediabunny@1.46.0?bundle';
export async function exportTimelinePreviewMp4({ width = 640, height = 360, fps = 30, seconds = 2, audio = true } = {}) {
  const mb = await import(MEDIABUNNY_URL); requireExportParts(mb);
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha:false }); let captured = null, silent = null, audioStatus = 'not-requested';
  const output = new mb.Output({ format:new mb.Mp4OutputFormat(), target:new mb.BufferTarget({ onFinalize:b => { captured = b instanceof Uint8Array ? b : new Uint8Array(b); } }) });
  const videoSource = new mb.CanvasSource(canvas, { codec:'avc', bitrate:1_200_000, keyFrameInterval:1 });
  output.addVideoTrack(videoSource, { frameRate:fps });
  if (audio && mb.MediaStreamAudioTrackSource) ({ silent, audioStatus } = await tryAddSilentAudio(output, mb));
  await output.start();
  const frames = Math.max(1, Math.round(fps * seconds));
  for (let i = 0; i < frames; i += 1) { drawFrame(ctx, width, height, i, frames); await videoSource.add(i / fps, 1 / fps, { keyFrame:i % fps === 0 }); }
  videoSource.close(); await output.finalize(); silent?.stop();
  if (!captured?.length) throw new Error('mp4_export_empty');
  return { bytes:captured, mime:'video/mp4', width, height, fps, seconds, frames, audioStatus };
}
export function bytesToBase64(bytes) {
  let binary = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}
async function tryAddSilentAudio(output, mb) {
  try {
    const silent = await createSilentTrack();
    const source = new mb.MediaStreamAudioTrackSource(silent.track, { codec:'aac', bitrate:128_000 });
    source.errorPromise?.catch(() => {}); output.addAudioTrack(source, { name:'Silent AAC', languageCode:'und' });
    return { silent, audioStatus:'aac-silent-requested' };
  } catch (e) { return { silent:null, audioStatus:`aac-unavailable:${e.message}` }; }
}
async function createSilentTrack() {
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctor) throw new Error('audio_context_unavailable');
  const context = new Ctor({ sampleRate:48000 });
  if (context.state !== 'running') await Promise.race([context.resume().catch(() => null), new Promise(r => setTimeout(r, 800))]);
  if (context.state !== 'running') throw new Error('audio_context_not_running');
  const oscillator = context.createOscillator(), gain = context.createGain(), destination = context.createMediaStreamDestination();
  gain.gain.value = 0; oscillator.connect(gain); gain.connect(destination); oscillator.start();
  const track = destination.stream.getAudioTracks()[0]; if (!track) throw new Error('silent_track_missing');
  return { track, stop:() => { try { oscillator.stop(); } catch {} track.stop(); context.close?.(); } };
}
function drawFrame(ctx, width, height, index, total) {
  const t = index / Math.max(1, total - 1); ctx.fillStyle = '#081122'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#7c5cff'; ctx.fillRect(0, height * .62, width, height * .38);
  ctx.fillStyle = '#83ffe7'; ctx.fillRect(24 + t * (width - 96), 40, 72, 72);
  ctx.fillStyle = 'white'; ctx.font = '28px system-ui'; ctx.fillText('Nesher WebCodecs Export', 32, height - 54);
  ctx.font = '18px system-ui'; ctx.fillText(`frame ${index + 1}/${total}`, 32, height - 24);
}
function requireExportParts(mb) { for (const name of ['Output','Mp4OutputFormat','BufferTarget','CanvasSource']) if (!mb[name]) throw new Error(`mediabunny_missing_${name}`); }
