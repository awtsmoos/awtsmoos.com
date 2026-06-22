/* B"H
Captured tab audio is packetized, not hoarded. The river flows into IndexedDB stones.
*/
import { clearAudioSession, putAudioPacket, readAudioShim } from './audioPackets.js';

export async function startAudioCapture(state) {
  const streams = state.sources.map(s => s.stream).filter(stream => stream?.getAudioTracks?.().length);
  const sessionId = 'nesher-audio-' + Date.now();
  await clearAudioSession(sessionId);
  if (!streams.length) return { sessionId, active: false, stop: () => {}, finalize: d => readAudioShim(sessionId, d) };
  const ctx = new AudioContext({ sampleRate: 48000 });
  const destination = ctx.createMediaStreamDestination();
  const gain = ctx.createGain(); gain.gain.value = 1; gain.connect(destination);
  streams.forEach(stream => ctx.createMediaStreamSource(stream).connect(gain));
  const processor = ctx.createScriptProcessor(4096, 2, 2);
  let index = 0; const pending = new Set();
  processor.onaudioprocess = event => {
    const channels = Array.from({ length: event.inputBuffer.numberOfChannels }, (_, i) => new Float32Array(event.inputBuffer.getChannelData(i)));
    const task = putAudioPacket(sessionId, index++, event.inputBuffer.sampleRate, channels).finally(() => pending.delete(task));
    pending.add(task);
  };
  gain.connect(processor); processor.connect(ctx.destination);
  return {
    sessionId, active: true,
    stop: async () => { processor.disconnect(); gain.disconnect(); await Promise.all([...pending]); await ctx.close(); },
    finalize: duration => readAudioShim(sessionId, duration, ctx.sampleRate)
  };
}
