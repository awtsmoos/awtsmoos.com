/* B"H
Recorder guards: gates before the encoder palace.
The Awtsmoos may pour light through many browsers; this file names what is present.
*/
export function assertVideoWebCodecs() {
  if (!('VideoEncoder' in globalThis) || !('VideoFrame' in globalThis)) {
    throw new Error('WebCodecs VideoEncoder/VideoFrame are unavailable.');
  }
}

export function canEncodeAudio() {
  return 'AudioEncoder' in globalThis && 'MediaStreamTrackProcessor' in globalThis;
}

export async function supportedVp9Config({ width, height, fps, bitrate }) {
  const requested = { codec:'vp09.00.10.08', width, height, bitrate, framerate:fps, latencyMode:'quality' };
  const support = await VideoEncoder.isConfigSupported(requested);
  if (!support.supported) throw new Error('WebCodecs VP9 encoder is not supported in this browser context.');
  return support.config;
}

export async function supportedOpusConfig({ sampleRate = 48000, numberOfChannels = 2, bitrate = 128000 } = {}) {
  if (!canEncodeAudio()) return null;
  const requested = { codec:'opus', sampleRate, numberOfChannels, bitrate };
  const support = await AudioEncoder.isConfigSupported(requested);
  return support.supported ? support.config : null;
}

export function assertMuxerAudio(muxer) {
  if (typeof muxer?.addAudioChunk !== 'function') throw new Error('webm-muxer audio chunk support is unavailable.');
}
