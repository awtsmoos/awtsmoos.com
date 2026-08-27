/* B"H
WebCodecs benchmark: encode bouncing-ball canvas frames and measure actual browser speed.
*/
import { drawBouncingBallFrame } from './bouncingBallFrame.js';
import { gradeBenchmark } from './benchmarkGrade.js';

export async function runBouncingBallEncodingBenchmark(input = {}) {
  const spec = normalize(input);
  if (!globalThis.VideoEncoder) return unavailable(spec, 'VideoEncoder unavailable');
  const support = await supportConfig(spec); if (!support.supported) return unavailable(spec, support.reason);
  const canvas = document.createElement('canvas'); canvas.width = spec.width; canvas.height = spec.height;
  const ctx = canvas.getContext('2d', { alpha:false }); let bytes = 0, chunks = 0;
  const encoder = new VideoEncoder({ output:chunk => { bytes += chunk.byteLength; chunks++; }, error:e => { throw e; } });
  encoder.configure(support.config); const started = performance.now();
  for (let i = 0; i < spec.frames; i++) { drawBouncingBallFrame(ctx, spec, i); const frame = new VideoFrame(canvas, { timestamp:Math.round(i * 1_000_000 / spec.fps) }); encoder.encode(frame, { keyFrame:i % spec.fps === 0 }); frame.close(); }
  await encoder.flush(); encoder.close(); const ms = performance.now() - started;
  const result = resultFrom(spec, { ms, bytes, chunks, config:support.config }); return { ...result, grade:gradeBenchmark(result) };
}
function normalize(input) { const fps = Number(input.fps || 30), seconds = Number(input.seconds || 3); return { width:Number(input.width || 640), height:Number(input.height || 360), fps, seconds, frames:Math.max(1, Math.round(fps * seconds)), bitrate:Number(input.bitrate || 2_000_000), codec:input.codec || 'vp8' }; }
async function supportConfig(spec) { const config = { codec:spec.codec, width:spec.width, height:spec.height, bitrate:spec.bitrate, framerate:spec.fps, latencyMode:'realtime' }; try { const r = await VideoEncoder.isConfigSupported(config); return { supported:!!r.supported, config:r.config || config, reason:r.supported ? '' : 'config unsupported' }; } catch (e) { return { supported:false, config, reason:e.message }; } }
function resultFrom(spec, run) { const encodeFps = spec.frames / Math.max(.001, run.ms / 1000), realtimeFactor = encodeFps / spec.fps, mbps = run.bytes * 8 / Math.max(1, spec.seconds) / 1_000_000; return { supported:true, ...spec, ms:run.ms, encodeFps, realtimeFactor, bytes:run.bytes, chunks:run.chunks, mbps, config:run.config }; }
function unavailable(spec, reason) { return { supported:false, ...spec, ms:0, encodeFps:0, realtimeFactor:0, bytes:0, chunks:0, mbps:0, reason, grade:gradeBenchmark({ supported:false }) }; }
