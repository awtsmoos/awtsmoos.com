/* B"H
Video frame pump: the canvas is sampled in measured breaths.
Each VideoFrame is born, encoded, closed, and returned to nothing.
*/
import { supportedVp9Config } from './recorderGuards.js';

export async function startVideoFramePump({ canvas, fps, bitrate, drawFrame, muxer, onStatus }) {
  const width = canvas.width, height = canvas.height;
  const config = await supportedVp9Config({ width, height, fps, bitrate });
  const errors = [];
  const encoder = new VideoEncoder({ output:(chunk, meta) => muxer.addVideoChunk(chunk, meta), error:e => errors.push(e.message || String(e)) });
  encoder.configure(config);
  let frameIndex = 0, stopped = false, pumping = false;
  const frameDuration = Math.round(1000000 / fps);
  const timer = setInterval(() => pump(), Math.max(16, Math.round(1000 / fps)));
  await pump();
  onStatus?.(`WebCodecs VP9 video recording ${width}×${height} @ ${fps}fps.`);
  return { stop, pumpNow:pump, config, errors, get frames(){ return frameIndex; } };

  async function pump() {
    if (stopped || pumping) return;
    pumping = true;
    try {
      drawFrame?.();
      const timestamp = frameIndex * frameDuration;
      const frame = new VideoFrame(canvas, { timestamp, duration:frameDuration });
      encoder.encode(frame, { keyFrame: frameIndex % Math.max(1, fps * 2) === 0 });
      frame.close();
      frameIndex += 1;
    } catch (e) {
      const message = e.message || String(e);
      errors.push(message);
      onStatus?.(`WebCodecs frame error: ${message}`);
    } finally { pumping = false; }
  }

  async function stop() {
    stopped = true;
    clearInterval(timer);
    if (pumping) await new Promise(resolve => setTimeout(resolve, 25));
    if (frameIndex === 0) throw new Error(`WebCodecs recorder produced zero frames: ${errors.join('; ') || 'no frame pump'}`);
    await encoder.flush();
    encoder.close();
    return { frames:frameIndex, codec:config.codec, errors:errors.slice() };
  }
}
