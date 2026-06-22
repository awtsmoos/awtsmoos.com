/* B"H
WebCodecs-only WebM streaming: VideoEncoder emits chunks, webm-muxer emits
monotonic headers/clusters suitable for onward streaming. 
*/
import { chunkToBase64, makeLocalTunnelStreaming } from '../streaming/localTunnelStreaming.js';
import { supportedVp9Config } from './webmRecorder.js';
const WEBM_MUXER_URL = 'https://esm.sh/webm-muxer@5.1.2?bundle';

export async function startWebCodecsWebmStream({ canvas, fps, bitrate, drawFrame, onStatus, tunnelBase }) {
  if (!('VideoEncoder' in globalThis) || !('VideoFrame' in globalThis)) throw new Error('WebCodecs are unavailable.');
  const { Muxer, StreamTarget } = await import(WEBM_MUXER_URL);
  const width = canvas.width, height = canvas.height;
  const config = await supportedVp9Config({ width, height, fps, bitrate });
  const tunnel = makeLocalTunnelStreaming(tunnelBase || 'http://127.0.0.1:3977');
  let sessionId = null, uploaded = 0, frameIndex = 0, stopped = false, pumping = false;
  const pieces = [], pending = [], errors = [];
  const target = new StreamTarget({
    onHeader:data => pushPiece('header', data, 0),
    onCluster:(data, _position, timestamp) => pushPiece('cluster', data, timestamp),
    onData:(_data, _position) => {}
  });
  const muxer = new Muxer({ target, video:{ codec:'V_VP9', width, height, frameRate:fps }, streaming:true, firstTimestampBehavior:'offset' });
  const encoder = new VideoEncoder({ output:(chunk, meta) => muxer.addVideoChunk(chunk, meta), error:e => errors.push(e.message || String(e)) });
  encoder.configure(config);
  try {
    const started = await tunnel.start({ label:'Nesher WebCodecs WebM', format:'webm', targetDuration:2 });
    sessionId = started.session?.id || started.id || started.sessionId || null;
  } catch (e) { onStatus?.(`Local tunnel unavailable; stream pieces will be tested locally. ${e.message}`); }
  const frameDuration = Math.round(1000000 / fps);
  const timer = setInterval(() => pump(), Math.max(16, Math.round(1000 / fps)));
  await pump();
  onStatus?.(`WebCodecs VP9 stream encoder running ${width}×${height}.`);
  return { stop, pumpNow:pump, pieces, get sessionId(){ return sessionId; }, get uploaded(){ return uploaded; } };

  async function pump() {
    if (stopped || pumping) return;
    pumping = true;
    try {
      drawFrame?.();
      const frame = new VideoFrame(canvas, { timestamp:frameIndex * frameDuration, duration:frameDuration });
      encoder.encode(frame, { keyFrame: frameIndex % Math.max(1, fps * 2) === 0 });
      frame.close(); frameIndex += 1;
    } catch (e) { errors.push(e.message || String(e)); }
    finally { pumping = false; }
  }
  async function stop() {
    stopped = true; clearInterval(timer);
    if (pumping) await new Promise(r => setTimeout(r, 25));
    if (frameIndex === 0) throw new Error(`WebCodecs stream produced zero frames: ${errors.join('; ') || 'no frame pump'}`);
    await encoder.flush(); encoder.close(); muxer.finalize(); await Promise.allSettled(pending);
    return { pieces, frames:frameIndex, uploaded, sessionId, errors:errors.slice() };
  }
  function pushPiece(kind, data, timestamp) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const name = `nesher-${kind}-${String(pieces.length).padStart(5, '0')}.webm`;
    pieces.push({ kind, timestamp, bytes:bytes.length, name });
    if (sessionId) pending.push(chunkToBase64(bytes).then(chunk64 => tunnel.pushChunk({ sessionId, name, contentType:'video/webm', chunk64 }).then(() => { uploaded += bytes.length; })));
  }
}
