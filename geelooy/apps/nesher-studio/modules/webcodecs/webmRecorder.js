/* B"H
WebCodecs-only WebM recording: raw canvas frames enter VideoEncoder;
EncodedVideoChunks enter webm-muxer; no MediaRecorder is used here.
*/
const WEBM_MUXER_URL = 'https://esm.sh/webm-muxer@5.1.2?bundle';

export async function startWebCodecsWebmRecorder({ canvas, fps, bitrate, drawFrame, onStatus }) {
  assertWebCodecs();
  const { Muxer, ArrayBufferTarget } = await import(WEBM_MUXER_URL);
  const width = canvas.width, height = canvas.height;
  const config = await supportedVp9Config({ width, height, fps, bitrate });
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video:{ codec:'V_VP9', width, height, frameRate:fps }, firstTimestampBehavior:'offset' });
  const errors = [];
  const encoder = new VideoEncoder({ output:(chunk, meta) => muxer.addVideoChunk(chunk, meta), error:e => errors.push(e.message || String(e)) });
  encoder.configure(config);
  let frameIndex = 0, stopped = false, pumping = false;
  const frameDuration = Math.round(1000000 / fps);
  const timer = setInterval(() => pump(), Math.max(16, Math.round(1000 / fps)));
  await pump();
  onStatus?.(`WebCodecs VP9 recording ${width}×${height} @ ${fps}fps.`);
  return { stop, pumpNow:pump, get frames(){ return frameIndex; }, get errors(){ return errors.slice(); } };

  async function pump() {
    if (stopped || pumping) return;
    pumping = true;
    try {
      drawFrame?.();
      const timestamp = frameIndex * frameDuration;
      const frame = new VideoFrame(canvas, { timestamp, duration:frameDuration });
      encoder.encode(frame, { keyFrame: frameIndex % Math.max(1, fps * 2) === 0 });
      frame.close(); frameIndex += 1;
    } catch (e) {
      const message = e.message || String(e); errors.push(message); onStatus?.(`WebCodecs frame error: ${message}`);
    } finally { pumping = false; }
  }
  async function stop() {
    stopped = true; clearInterval(timer);
    if (pumping) await new Promise(r => setTimeout(r, 25));
    if (frameIndex === 0) throw new Error(`WebCodecs recorder produced zero frames: ${errors.join('; ') || 'no frame pump'}`);
    await encoder.flush(); encoder.close(); muxer.finalize();
    return { blob:new Blob([target.buffer], { type:'video/webm;codecs=vp9' }), frames:frameIndex, codec:config.codec, errors:errors.slice() };
  }
}

export async function supportedVp9Config({ width, height, fps, bitrate }) {
  const requested = { codec:'vp09.00.10.08', width, height, bitrate, framerate:fps, latencyMode:'quality' };
  const support = await VideoEncoder.isConfigSupported(requested);
  if (!support.supported) throw new Error('WebCodecs VP9 encoder is not supported in this browser context.');
  return support.config;
}

function assertWebCodecs() {
  if (!('VideoEncoder' in globalThis) || !('VideoFrame' in globalThis)) throw new Error('WebCodecs VideoEncoder/VideoFrame are unavailable.');
}
