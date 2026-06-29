/* B"H
Manual video pump: faster WebCodecs without backlog.
It listens for encoder dequeue, catches up when safe, and drops only when the queue would choke.
*/
import { supportedVideoConfig } from './recorderGuards.js';

export async function startVideoFramePump({ canvas, fps, bitrate, profile, drawFrame, muxer, onStatus }) {
  const width = canvas.width, height = canvas.height;
  const supported = await supportedVideoConfig({ width, height, fps, bitrate, profile });
  const errors = [], maxQueue = profile.maxQueue || 2, catchUpFrames = profile.catchUpFrames || 1;
  let frameIndex = 0, encodedFrames = 0, droppedFrames = 0, stopped = false, pumping = false, lastTimestamp = -1;
  const startMs = performance.now();
  const encoder = new VideoEncoder({ output:(chunk, meta) => { muxer.addVideoChunk(chunk, meta); encodedFrames += 1; }, error:e => errors.push(e.message || String(e)) });
  encoder.configure(supported.config);
  encoder.addEventListener?.('dequeue', () => catchUp());
  const frameMs = Math.max(8, Math.round(1000 / fps));
  const timer = setInterval(() => pump(), frameMs);
  await pump(true);
  onStatus?.(`Manual ${profile.label} ${width}×${height}; queue cap ${maxQueue}; bitrate ${Math.round(bitrate / 1000)}kbps.`);
  return { stop, pumpNow:pump, config:supported.config, muxCodec:supported.muxCodec, mimeCodec:supported.mimeCodec, errors, get frames(){ return frameIndex; }, get dropped(){ return droppedFrames; } };

  function catchUp() { for (let i = 0; i < catchUpFrames && encoder.encodeQueueSize < maxQueue; i++) pump(false, true); }
  async function pump(forceKeyFrame = false, catchUp = false) {
    if (stopped || pumping) return;
    if (encoder.encodeQueueSize > maxQueue) { droppedFrames += 1; return; }
    if (catchUp && encoder.encodeQueueSize >= maxQueue) return;
    pumping = true;
    try {
      drawFrame?.(); const timestamp = nextTimestamp(startMs, lastTimestamp); lastTimestamp = timestamp;
      const frame = new VideoFrame(canvas, { timestamp }); encoder.encode(frame, { keyFrame:forceKeyFrame || shouldKeyFrame(frameIndex, fps, profile) }); frame.close(); frameIndex += 1;
    } catch (e) { errors.push(e.message || String(e)); }
    finally { pumping = false; }
  }
  async function stop() {
    stopped = true; clearInterval(timer); if (pumping) await new Promise(resolve => setTimeout(resolve, 20));
    if (frameIndex === 0) throw new Error(`Manual WebCodecs recorder produced zero frames: ${errors.join('; ') || 'no frame pump'}`);
    await encoder.flush(); encoder.close(); return { frames:frameIndex, encodedFrames, droppedFrames, codec:supported.config.codec, mimeCodec:supported.mimeCodec, errors:errors.slice() };
  }
}
function nextTimestamp(startMs, lastTimestamp) { const now = Math.max(0, Math.round((performance.now() - startMs) * 1000)); return now <= lastTimestamp ? lastTimestamp + 1000 : now; }
function shouldKeyFrame(frameIndex, fps, profile) { const interval = Math.max(1, Math.round((profile.keyFrameSeconds || 2) * fps)); return frameIndex % interval === 0; }
