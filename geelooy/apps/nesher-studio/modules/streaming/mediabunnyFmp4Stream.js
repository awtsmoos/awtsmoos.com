/* B"H
MediaBunny fMP4 stream: the canvas becomes flowing fragments, not a promise.
*/
import { makeLocalTunnelStreaming, chunkToBase64 } from './localTunnelStreaming.js';
const MEDIABUNNY_URL = 'https://esm.sh/mediabunny@1.46.0?bundle';
export async function startMediabunnyFmp4Stream(state, options = {}) {
  const api = await import(MEDIABUNNY_URL);
  requireExports(api);
  const tunnel = makeLocalTunnelStreaming(options.baseUrl || 'http://127.0.0.1:3977');
  const started = await tunnel.start({ label:'Nesher MediaBunny fMP4', mode:'hls', format:'fmp4', targetDuration:options.targetDuration || 2 });
  const sessionId = started.session?.id;
  if (!sessionId) throw new Error('local_stream_session_missing_id');
  const mux = makeMuxer({ api, tunnel, sessionId, state, targetDuration:options.targetDuration || 2 });
  await mux.start();
  return mux;
}
function makeMuxer({ api, tunnel, sessionId, state, targetDuration }) {
  let ftyp, moov, lastMoof, stopped = false, segmentIndex = 0, frameIndex = 0, nextAt = 0, pending = Promise.resolve();
  const format = new api.Mp4OutputFormat({ fastStart:'fragmented', minimumFragmentDuration:targetDuration, onFtyp:data=>{ ftyp=data; }, onMoov:data=>{ moov=data; enqueueInit(); }, onMoof:data=>{ lastMoof=data; }, onMdat:data=>{ enqueueSegment(data); } });
  const output = new api.Output({ target:new api.NullTarget(), format });
  const source = new api.CanvasSource(document.getElementById('stage'), { codec:'avc', bitrate:Math.max(900000, state.width * state.height * 2) });
  output.addVideoTrack(source, { frameRate:state.fps || 30 });
  return { sessionId, start, stop };
  async function start() { state.streamStartMs = performance.now(); await output.start(); nextAt = performance.now(); requestAnimationFrame(pump); }
  async function pump() {
    if (stopped) return;
    try {
      const now = performance.now(), frameDuration = 1 / (state.fps || 30), frameMs = frameDuration * 1000;
      if (now >= nextAt) {
        const timestamp = Math.max(0, (now - state.streamStartMs) / 1000);
        const keyFrame = frameIndex === 0 || Math.floor(timestamp / targetDuration) !== Math.floor((timestamp - frameDuration) / targetDuration);
        await source.add(timestamp, frameDuration, { keyFrame });
        frameIndex += 1; nextAt = now + frameMs;
      }
    } catch (e) { console.warn('Nesher fMP4 frame skipped:', e.message); }
    requestAnimationFrame(pump);
  }
  async function stop() { stopped = true; await output.finalize(); await pending; return tunnel.stop({ sessionId }); }
  function enqueueInit() {
    if (!ftyp || !moov) return;
    const header = joinBytes(ftyp, moov);
    pending = pending.then(async () => tunnel.pushChunk({ sessionId, name:'init.mp4', contentType:'video/mp4', chunk64:await chunkToBase64(header) }));
  }
  function enqueueSegment(mdat) {
    if (!lastMoof) return;
    const bytes = joinBytes(lastMoof, mdat);
    const index = segmentIndex++;
    pending = pending.then(async () => tunnel.pushHlsSegment({ sessionId, name:`nesher-${String(index).padStart(6, '0')}.m4s`, index, duration:targetDuration, contentType:'video/iso.segment', mapUri:'init.mp4', chunk64:await chunkToBase64(bytes) }));
  }
}
function joinBytes(a, b) { const out = new Uint8Array(a.length + b.length); out.set(a, 0); out.set(b, a.length); return out; }
function requireExports(api) { for (const name of ['Output', 'Mp4OutputFormat', 'NullTarget', 'CanvasSource']) if (!api[name]) throw new Error(`mediabunny_missing_${name}`); }
