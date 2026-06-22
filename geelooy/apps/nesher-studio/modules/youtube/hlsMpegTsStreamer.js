/* B"H
YouTube-shaped HLS stream: canvas -> Mediabunny CanvasSource -> H.264 MPEG-TS
segments -> local tunnel raw HLS segment route.
*/
import { makeLocalTunnelStreaming } from '../streaming/localTunnelStreaming.js';
const MEDIABUNNY_URL = 'https://esm.sh/mediabunny@1.46.0?bundle';

export async function createYoutubeHlsMpegTsStreamer({ canvas, fps = 30, bitrate = 4_000_000, targetDuration = 2, tunnelBase, drawFrame, onStatus }) {
  const mb = await import(MEDIABUNNY_URL); requireMediabunny(mb);
  const tunnel = makeLocalTunnelStreaming(tunnelBase || 'http://127.0.0.1:3977');
  const started = await tunnel.start({ label:'Nesher YouTube HLS MPEG-TS', format:'hls-mpegts', targetDuration });
  const sessionId = started.session?.id || started.id || started.sessionId;
  if (!sessionId) throw new Error('hls_session_missing_id');
  const state = { sessionId, files:new Map(), uploaded:0, segments:[], playlists:[], errors:[], frameIndex:0, stopped:false };
  const output = new mb.Output({
    format:new mb.HlsOutputFormat({
      segmentFormat:new mb.MpegTsOutputFormat(), targetDuration, live:true, maxLiveSegmentCount:6,
      onPlaylist:content => state.playlists.push(content),
      onSegment:(_target, info) => state.segments.push({ info, at:Date.now() })
    }),
    target:new mb.PathedTarget('master.m3u8', ({ path }) => new mb.BufferTarget({ onFinalize:buffer => state.files.set(path, buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)) }))
  });
  const source = new mb.CanvasSource(canvas, { codec:'avc', bitrate, keyFrameInterval:targetDuration });
  output.addVideoTrack(source); await output.start();
  onStatus?.(`YouTube HLS encoder started: H.264 MPEG-TS @ ${fps}fps.`);
  return { sessionId, addFrame, stop, state };

  async function addFrame() {
    if (state.stopped) return;
    drawFrame?.();
    const timestamp = state.frameIndex / fps;
    await source.add(timestamp, 1 / fps, { keyFrame: state.frameIndex % Math.max(1, fps * targetDuration) === 0 });
    state.frameIndex += 1;
  }
  async function stop() {
    state.stopped = true; source.close(); await output.finalize();
    await uploadFiles({ state, tunnel, targetDuration });
    const playlist = await tunnel.playlist({ sessionId, endList:true }).catch(error => ({ ok:false, error:error.message }));
    await tunnel.stop({ sessionId });
    return { sessionId, frames:state.frameIndex, uploaded:state.uploaded, files:[...state.files.keys()], segments:state.segments.length, playlists:state.playlists.length, playlist, errors:state.errors.slice() };
  }
}

async function uploadFiles({ state, tunnel, targetDuration }) {
  let index = 0;
  for (const [name, bytes] of state.files) {
    if (!/\.ts$/i.test(name)) continue;
    const result = await tunnel.pushHlsSegmentRaw({ sessionId:state.sessionId, name, index, duration:targetDuration, contentType:'video/mp2t', bytes });
    state.uploaded += Number(result.bytes || bytes.length); index += 1;
  }
}
function requireMediabunny(mb) { for (const name of ['Output','HlsOutputFormat','MpegTsOutputFormat','PathedTarget','BufferTarget','CanvasSource']) if (!mb[name]) throw new Error(`mediabunny_missing_${name}`); }
