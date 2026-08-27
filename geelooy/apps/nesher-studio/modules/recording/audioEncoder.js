/* B"H
Manual audio encoder: direct external tracks and mixed tracks alike become Opus by WebCodecs.
The first path avoids unnecessary mixing; the second path gathers many voices with care.
*/
import { assertMuxerAudio, supportedOpusConfig } from './recorderGuards.js';

export async function startMuxedAudioEncoder({ audioSource, muxer, bitrate = 160000, onStatus } = {}) {
  if (!audioSource?.active) return inactiveAudioEncoder(audioSource?.reason || 'no audio source');
  assertMuxerAudio(muxer);
  const config = await supportedOpusConfig({ sampleRate:audioSource.sampleRate, numberOfChannels:audioSource.numberOfChannels, bitrate });
  if (!config) return inactiveAudioEncoder('WebCodecs Opus audio encoder unavailable');
  const errors = [];
  const encoder = new AudioEncoder({ output:(chunk, meta) => muxer.addAudioChunk(chunk, meta), error:e => errors.push(e.message || String(e)) });
  encoder.configure(config);
  const reader = new MediaStreamTrackProcessor({ track:audioSource.track }).readable.getReader();
  let stopped = false, frames = 0;
  const loop = readLoop();
  onStatus?.(`Manual Opus ${audioSource.mode} audio: ${audioSource.summary}.`);
  return { active:true, config, errors, get frames(){ return frames; }, stop };

  async function readLoop() {
    while (!stopped) {
      const { done, value } = await reader.read();
      if (done) break;
      try { encoder.encode(value); frames += 1; }
      catch (e) { errors.push(e.message || String(e)); }
      finally { value?.close?.(); }
    }
  }

  async function stop() {
    stopped = true;
    try { await reader.cancel(); } catch {}
    await loop.catch(e => errors.push(e.message || String(e)));
    await encoder.flush();
    encoder.close();
    await audioSource.stop?.();
    return { active:true, frames, codec:config.codec, errors:errors.slice() };
  }
}

export function inactiveAudioEncoder(reason) {
  return { active:false, reason, errors:[], frames:0, stop:async () => ({ active:false, reason, frames:0, errors:[] }) };
}
