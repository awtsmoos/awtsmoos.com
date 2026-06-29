/* B"H
Audio frame: live analyser data when possible, synthetic breath when silence/test has no stream.
*/
import { analyzeAudioFeatures } from './audioFeatures.js';

export function audioFrameFor(source) {
  const runtime = source.visualizerRuntime ||= { taps:new Map(), frameIndex:0 };
  const targets = source.sourcesProvider?.() || [];
  const taps = targets.map(target => ensureTap(runtime, target)).filter(Boolean);
  cleanup(runtime, targets);
  return taps.length ? mixedFrame(runtime, taps, targets) : syntheticFrame(runtime, targets);
}
function ensureTap(runtime, target) {
  if (!target.stream?.getAudioTracks?.().length) return null;
  if (runtime.taps.has(target.id)) return runtime.taps.get(target.id);
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext; if (!AudioContext) return null;
  runtime.context ||= new AudioContext(); runtime.context.resume?.().catch?.(() => {});
  const analyser = runtime.context.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = .78;
  runtime.context.createMediaStreamSource(target.stream).connect(analyser);
  const tap = { id:target.id, analyser, time:new Uint8Array(analyser.fftSize), freq:new Uint8Array(analyser.frequencyBinCount) };
  runtime.taps.set(target.id, tap); return tap;
}
function mixedFrame(runtime, taps, targets) {
  const time = new Float32Array(64), freq = new Float32Array(64);
  taps.forEach(tap => { tap.analyser.getByteTimeDomainData(tap.time); tap.analyser.getByteFrequencyData(tap.freq); addBytes(time, tap.time, 128); addBytes(freq, tap.freq, 0); });
  scale(time, taps.length); scale(freq, taps.length); return frame(runtime, time, freq, targets);
}
function syntheticFrame(runtime, targets) {
  const time = new Float32Array(64), freq = new Float32Array(64), t = runtime.frameIndex / 18;
  for (let i = 0; i < 64; i++) { time[i] = Math.sin(i * .33 + t) * .45 + Math.sin(i * .09 + t * 2) * .22; freq[i] = Math.abs(Math.sin(i * .21 + t)) * .72; }
  return frame(runtime, time, freq, targets);
}
function frame(runtime, time, freq, targets) { const features = analyzeAudioFeatures(freq, runtime); return { index:runtime.frameIndex++, t:now(), time, freq, level:features.level, features, sources:targets }; }
function addBytes(out, bytes, center) { for (let i = 0; i < out.length; i++) out[i] += (bytes[i % bytes.length] - center) / 128; }
function scale(out, count) { for (let i = 0; i < out.length; i++) out[i] /= Math.max(1, count); }
function cleanup(runtime, targets) { const live = new Set(targets.map(t => t.id)); for (const id of runtime.taps.keys()) if (!live.has(id)) runtime.taps.delete(id); }
function now() { return (globalThis.performance?.now?.() || Date.now()) / 1000; }
