/* B"H
WebCodecs WebM recorder: the picture is VP9, the breath is optional Opus,
and the Awtsmoos gathers both into one file when source audio exists and can encode.
*/
import { createSourceAudioMix } from '../recording/audioMix.js';
import { inactiveAudioEncoder, startMuxedAudioEncoder } from '../recording/audioEncoder.js';
import { assertVideoWebCodecs, supportedOpusConfig } from '../recording/recorderGuards.js';
import { describeAudioSources } from '../recording/sourceAudio.js';
import { startVideoFramePump } from '../recording/videoFramePump.js';
import { createWebmMuxer, finalizeWebmTarget } from '../recording/webmMuxerFactory.js';

export async function startWebCodecsWebmRecorder({ canvas, fps, bitrate, drawFrame, sources = [], onStatus }) {
  assertVideoWebCodecs();
  const width = canvas.width, height = canvas.height;
  let audioMix = null, video = null, audio = null;
  try {
    audioMix = await createSourceAudioMix(sources);
    const audioConfig = await prepareAudioConfig(audioMix);
    const muxAudio = audioConfig ? { ...audioMix, config:audioConfig } : null;
    const { muxer, target } = await createWebmMuxer({ width, height, fps, audio:muxAudio });
    video = await startVideoFramePump({ canvas, fps, bitrate, drawFrame, muxer, onStatus });
    audio = muxAudio ? await startMuxedAudioEncoder({ audioMix, muxer, config:audioConfig, onStatus }) : inactiveAudioEncoder(audioMix?.reason || 'WebCodecs Opus audio encoder unavailable');
    reportAudioState(audio, sources, onStatus);
    return { stop:() => stopRecorder({ video, audio, audioMix, muxer, target }), pumpNow:video.pumpNow, get frames(){ return video.frames; }, get errors(){ return [...video.errors, ...audio.errors]; } };
  } catch (error) {
    await cleanupOpenPieces(video, audio, audioMix);
    throw error;
  }
}

async function prepareAudioConfig(audioMix) {
  if (!audioMix?.active) return null;
  return supportedOpusConfig({ sampleRate:audioMix.sampleRate, numberOfChannels:audioMix.numberOfChannels });
}

function reportAudioState(audio, sources, onStatus) {
  if (audio.active) onStatus?.(`Recording WebM with audio: ${describeAudioSources(sources)}.`);
  else onStatus?.(`Recording video-only: ${audio.reason || describeAudioSources(sources)}.`);
}

async function stopRecorder({ video, audio, audioMix, muxer, target }) {
  const videoResult = await video.stop();
  const audioResult = await audio.stop();
  await audioMix?.stop?.();
  muxer.finalize();
  const codecs = audioResult.active ? 'vp9,opus' : 'vp9';
  return {
    blob:finalizeWebmTarget(target, codecs),
    frames:videoResult.frames,
    audioFrames:audioResult.frames || 0,
    audioActive:!!audioResult.active,
    codec:videoResult.codec,
    audioCodec:audioResult.codec || null,
    errors:[...videoResult.errors, ...(audioResult.errors || [])]
  };
}

async function cleanupOpenPieces(video, audio, audioMix) {
  try { await video?.stop?.(); } catch {}
  try { await audio?.stop?.(); } catch {}
  try { await audioMix?.stop?.(); } catch {}
}

export { supportedVp9Config } from '../recording/recorderGuards.js';
