/* B"H
Manual WebCodecs WebM recorder: no browser recorder, no surrender.
Speed comes from VP8/VP9 profiles, queue discipline, and direct audio when possible.
*/
import { inactiveAudioEncoder, startMuxedAudioEncoder } from '../recording/audioEncoder.js';
import { createManualAudioSource } from '../recording/manualAudioSource.js';
import { getRecordingProfile } from '../recording/manualRecordingProfile.js';
import { assertManualWebCodecs } from '../recording/recorderGuards.js';
import { startVideoFramePump } from '../recording/videoFramePump.js';
import { codecString, createWebmMuxer, finalizeWebmTarget } from '../recording/webmMuxerFactory.js';

export async function startWebCodecsWebmRecorder({ canvas, fps, bitrate, profileId, drawFrame, sources = [], onStatus }) {
  assertManualWebCodecs();
  const profile = getRecordingProfile(profileId);
  let audioSource = null, video = null, audio = null;
  try {
    audioSource = await createManualAudioSource(sources, { audioBitrate:profile.audioBitrate });
    const { muxer, target } = await createWebmMuxer({ width:canvas.width, height:canvas.height, fps, video:profile, audio:audioSource });
    video = await startVideoFramePump({ canvas, fps, bitrate, profile, drawFrame, muxer, onStatus });
    audio = audioSource.active ? await startMuxedAudioEncoder({ audioSource, muxer, bitrate:profile.audioBitrate, onStatus }) : inactiveAudioEncoder(audioSource.reason);
    reportState(profile, audioSource, onStatus);
    return { stop:() => stopRecorder({ video, audio, audioSource, muxer, target, profile }), pumpNow:video.pumpNow, get frames(){ return video.frames; }, get errors(){ return [...video.errors, ...audio.errors]; } };
  } catch (error) {
    await cleanupOpenPieces(video, audio, audioSource);
    throw error;
  }
}

function reportState(profile, audioSource, onStatus) {
  const audio = audioSource.active ? `${audioSource.mode} audio: ${audioSource.summary}` : `video-only: ${audioSource.reason}`;
  onStatus?.(`Manual WebCodecs ${profile.label}; ${audio}.`);
}

async function stopRecorder({ video, audio, audioSource, muxer, target, profile }) {
  const videoResult = await video.stop();
  const audioResult = await audio.stop();
  if (!audioResult.active) await audioSource?.stop?.();
  muxer.finalize();
  const codecs = codecString(profile.mimeCodec, audioResult.active);
  return {
    blob:finalizeWebmTarget(target, codecs),
    frames:videoResult.frames,
    encodedFrames:videoResult.encodedFrames,
    droppedFrames:videoResult.droppedFrames,
    audioFrames:audioResult.frames || 0,
    audioActive:!!audioResult.active,
    codec:videoResult.codec,
    audioCodec:audioResult.codec || null,
    errors:[...videoResult.errors, ...(audioResult.errors || [])]
  };
}

async function cleanupOpenPieces(video, audio, audioSource) {
  try { await video?.stop?.(); } catch {}
  try { await audio?.stop?.(); } catch {}
  try { await audioSource?.stop?.(); } catch {}
}

export { supportedVideoConfig as supportedVp9Config } from '../recording/recorderGuards.js';
