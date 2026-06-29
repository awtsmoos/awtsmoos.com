/* B"H
Audio encoder: the mixed stream becomes Opus chunks for the same WebM vessel.
The breath is read, encoded, closed, and joined to the picture without hoarding.
*/
import { assertMuxerAudio, supportedOpusConfig } from './recorderGuards.js';

export async function startMuxedAudioEncoder({ audioMix, muxer, config, onStatus } = {}) {
  if (!audioMix?.active) return inactiveAudioEncoder(audioMix?.reason || 'no audio mix');
  assertMuxerAudio(muxer);
  const track = audioMix.stream?.getAudioTracks?.()[0];
  if (!track) return inactiveAudioEncoder('mixed stream has no audio track');
  const audioConfig = config || await supportedOpusConfig({ sampleRate:audioMix.sampleRate, numberOfChannels:audioMix.numberOfChannels });
  if (!audioConfig) return inactiveAudioEncoder('WebCodecs Opus audio encoder unavailable');
  const errors = [];
  const encoder = new AudioEncoder({ output:(chunk, meta) => muxer.addAudioChunk(chunk, meta), error:e => errors.push(e.message || String(e)) });
  encoder.configure(audioConfig);
  const processor = new MediaStreamTrackProcessor({ track });
  const reader = processor.readable.getReader();
  let stopped = false, frames = 0;
  const loop = readLoop();
  onStatus?.(`Recording ${audioMix.sourceCount} mixed audio source${audioMix.sourceCount === 1 ? '' : 's'} as Opus.`);
  return { active:true, config:audioConfig, errors, get frames(){ return frames; }, stop };

  async function readLoop() {
    while (!stopped) {
      const { done, value } = await reader.read();
      if (done || stopped) { value?.close?.(); break; }
      try { encoder.encode(value); frames += 1; }
      catch (e) { errors.push(e.message || String(e)); }
      finally { value.close?.(); }
    }
  }

  async function stop() {
    stopped = true;
    try { await reader.cancel(); } catch {}
    await loop.catch(e => errors.push(e.message || String(e)));
    await encoder.flush();
    encoder.close();
    return { active:true, frames, codec:audioConfig.codec, errors:errors.slice() };
  }
}

export function inactiveAudioEncoder(reason) {
  return { active:false, reason, errors:[], frames:0, stop:async () => ({ active:false, reason, frames:0, errors:[] }) };
}
