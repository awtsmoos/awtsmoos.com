/* B"H
YouTube-shaped HLS stream: canvas -> Mediabunny CanvasSource -> H.264 MPEG-TS
segments -> local tunnel raw HLS route. No MediaRecorder.
*/
import { makeLocalTunnelStreaming } from '../streaming/localTunnelStreaming.js';
const MEDIABUNNY_URL = 'https://esm.sh/mediabunny@1.46.0?bundle';

export async function startHlsTsStream({ canvas, fps, bitrate, drawFrame, onStatus, tunnelBase, targetDuration = 1 }) {
  const mb = await import(MEDIABUNNY_URL);
  requireHlsExports(mb);
  const tunnel = makeLocalTunnelStreaming(tunnelBase || 'http://127.0.0.1:3977');
  const started = await tunnel.start({ label:'Nesher H.264 MPEG-TS HLS', format:'hls-mpegts', targetDuration });
  const sessionId = started.session?.id || started.id || started.sessionId;
  if (!sessionId) throw new Error('hls_session_missing_id');
  let frameIndex = 0, segmentIndex = 0, stopped = false, pumping = false, uploaded = 0;
  const pieces = [], pending = [], errors = [];
  const source = new mb.CanvasSource(canvas, { codec:'avc', bitrate, keyFrameInterval:targetDuration });
  const output = new mb.Output({
    format:new mb.HlsOutputFormat({ segmentFormat:new mb.MpegTsOutputFormat(), targetDuration, live:true, maxLiveSegmentCount:6 }),
    target:new mb.PathedTarget('master.m3u8', ({ path }) => new mb.BufferTarget({ onFinalize:buffer => capturePath(path, buffer) }))
  });
  output.addVideoTrack(source);
  await output.start();
  const timer = setInterval(() => pump(), Math.max(16, Math.round(1000 / fps)));
  await pump();
  onStatus?.(`H.264 MPEG-TS HLS stream started. Session ${sessionId}.`);
  return { stop, pumpNow:pump, pieces, get sessionId(){ return sessionId; }, get uploaded(){ return uploaded; } };

  async function pump() {
    if (stopped || pumping) return;
    pumping = true;
    try {
      drawFrame?.();
      const timestamp = frameIndex / fps;
      await source.add(timestamp, 1 / fps, { keyFrame:frameIndex % Math.max(1, Math.round(fps * targetDuration)) === 0 });
      frameIndex += 1;
    } catch (e) { errors.push(e.message || String(e)); }
    finally { pumping = false; }
  }
  async function stop() {
    stopped = true; clearInterval(timer);
    if (pumping) await new Promise(r => setTimeout(r, 25));
    await output.finalize();
    await Promise.allSettled(pending);
    await tunnel.stop({ sessionId });
    return { sessionId, frames:frameIndex, pieces, uploaded, errors:errors.slice() };
  }
  function capturePath(path, buffer) {
    const bytes = new Uint8Array(buffer);
    pieces.push({ path, bytes:bytes.length });
    if (!path.endsWith('.ts')) return;
    const index = segmentIndex++;
    pending.push(tunnel.pushHlsSegmentRaw({ sessionId, name:path, bytes, duration:targetDuration, index, contentType:'video/mp2t' }).then(() => { uploaded += bytes.length; }));
  }
}
function requireHlsExports(mb) {
  for (const name of ['Output','HlsOutputFormat','MpegTsOutputFormat','PathedTarget','BufferTarget','CanvasSource']) if (!mb[name]) throw new Error(`mediabunny_missing_${name}`);
}
