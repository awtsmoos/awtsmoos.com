/* B"H
Canvas becomes H.264, silence becomes AAC, and complete MPEG-TS segments upload
through the local Awtsmoos tunnel as soon as Mediabunny finalizes each segment.
*/
import { makeLocalTunnelStreaming } from '../streaming/localTunnelStreaming.js';
const MEDIABUNNY_URL = 'https://esm.sh/mediabunny@1.46.0?bundle';

export async function createYoutubeHlsMpegTsStreamer({ canvas, fps = 30, bitrate = 4_000_000, audioBitrate = 128_000, targetDuration = 2, tunnelBase, drawFrame, onStatus }) {
  const mb = await import(MEDIABUNNY_URL); requireMediabunny(mb);
  const tunnel = makeLocalTunnelStreaming(tunnelBase || 'http://127.0.0.1:3977');
  const started = await tunnel.start({ label:'Nesher YouTube HLS MPEG-TS AAC', format:'hls-mpegts-aac', targetDuration });
  const sessionId = started.session?.id || started.id || started.sessionId;
  if (!sessionId) throw new Error('hls_session_missing_id');
  const audio = await createSilentAudioTrack(); let segmentIndex = 0;
  const state = { sessionId, files:new Map(), uploaded:0, segments:[], playlists:[], errors:[], frameIndex:0, stopped:false, uploads:new Set(), pending:new Set() };
  const output = new mb.Output({
    format:new mb.HlsOutputFormat({ segmentFormat:new mb.MpegTsOutputFormat(), targetDuration, live:true, maxLiveSegmentCount:6, onPlaylist:x => state.playlists.push(x), onSegment:(_t, info) => state.segments.push({ info, at:Date.now() }) }),
    target:new mb.PathedTarget('master.m3u8', ({ path }) => new mb.BufferTarget({ onFinalize:buffer => captureFile(path, buffer) }))
  });
  const videoSource = new mb.CanvasSource(canvas, { codec:'avc', bitrate, keyFrameInterval:targetDuration });
  const audioSource = new mb.MediaStreamAudioTrackSource(audio.track, { codec:'aac', bitrate:audioBitrate });
  audioSource.errorPromise?.catch(error => state.errors.push(`audio:${error.message || error}`));
  output.addVideoTrack(videoSource, { frameRate:fps }); output.addAudioTrack(audioSource, { name:'Silent AAC', languageCode:'und' });
  await output.start(); onStatus?.(`YouTube HLS encoder started: H.264 + AAC MPEG-TS @ ${fps}fps.`);
  return { sessionId, addFrame, stop, state };

  async function addFrame() {
    if (state.stopped) return;
    drawFrame?.();
    const timestamp = state.frameIndex / fps;
    await videoSource.add(timestamp, 1 / fps, { keyFrame:state.frameIndex % Math.max(1, fps * targetDuration) === 0 });
    state.frameIndex += 1;
  }
  async function stop() {
    state.stopped = true; videoSource.close(); await output.finalize(); audio.stop();
    await Promise.allSettled([...state.pending]);
    const playlist = await tunnel.playlist({ sessionId, endList:true }).catch(error => ({ ok:false, error:error.message }));
    await tunnel.stop({ sessionId });
    return { sessionId, frames:state.frameIndex, uploaded:state.uploaded, files:[...state.files.keys()], segments:state.segments.length, playlists:state.playlists.length, playlist, errors:state.errors.slice(), audio:'aac-silent-track' };
  }
  function captureFile(path, buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer); state.files.set(path, bytes);
    if (!/\.ts$/i.test(path) || state.uploads.has(path)) return;
    state.uploads.add(path); const index = segmentIndex++;
    const task = tunnel.pushHlsSegmentRaw({ sessionId, name:path, index, duration:targetDuration, contentType:'video/mp2t', bytes }).then(result => { state.uploaded += Number(result.bytes || bytes.length); }).catch(e => state.errors.push(`upload:${e.message}`)).finally(() => state.pending.delete(task));
    state.pending.add(task);
  }
}

async function createSilentAudioTrack() {
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctor) throw new Error('audio_context_unavailable_for_aac_track');
  const context = new Ctor({ sampleRate:48000 });
  if (context.state !== 'running') await Promise.race([context.resume().catch(() => null), new Promise(r => setTimeout(r, 800))]);
  if (context.state !== 'running') throw new Error('audio_context_not_running_user_gesture_required');
  const oscillator = context.createOscillator(), gain = context.createGain(), destination = context.createMediaStreamDestination();
  gain.gain.value = 0; oscillator.connect(gain); gain.connect(destination); oscillator.start();
  const track = destination.stream.getAudioTracks()[0]; if (!track) throw new Error('silent_audio_track_unavailable');
  return { track, stop:() => { try { oscillator.stop(); } catch {} track.stop(); context.close?.(); } };
}
function requireMediabunny(mb) { for (const name of ['Output','HlsOutputFormat','MpegTsOutputFormat','PathedTarget','BufferTarget','CanvasSource','MediaStreamAudioTrackSource']) if (!mb[name]) throw new Error(`mediabunny_missing_${name}`); }
