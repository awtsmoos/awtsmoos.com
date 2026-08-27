/* B"H
Recorder guards: no browser recorder is invited here.
Only WebCodecs gates are checked before pixels and breath enter the manual vessel.
*/
export function assertManualWebCodecs() {
  if (!('VideoEncoder' in globalThis) || !('VideoFrame' in globalThis)) throw new Error('WebCodecs VideoEncoder/VideoFrame are unavailable.');
}

export function canEncodeAudio() {
  return 'AudioEncoder' in globalThis && 'MediaStreamTrackProcessor' in globalThis;
}

export async function supportedVideoConfig({ width, height, fps, bitrate, profile }) {
  assertManualWebCodecs();
  const requested = baseVideoConfig({ width, height, fps, bitrate, profile });
  const support = await VideoEncoder.isConfigSupported(requested);
  if (!support.supported) throw new Error(`WebCodecs ${profile.codec} video encoder is not supported here.`);
  return { config:support.config, muxCodec:profile.muxCodec, mimeCodec:profile.mimeCodec };
}

export async function supportedOpusConfig({ sampleRate = 48000, numberOfChannels = 2, bitrate = 160000 } = {}) {
  if (!canEncodeAudio()) return null;
  const requested = { codec:'opus', sampleRate, numberOfChannels, bitrate };
  const support = await AudioEncoder.isConfigSupported(requested);
  return support.supported ? support.config : null;
}

export function assertMuxerAudio(muxer) {
  if (typeof muxer?.addAudioChunk !== 'function') throw new Error('WebM muxer audio chunk support is unavailable.');
}

function baseVideoConfig({ width, height, fps, bitrate, profile }) {
  return {
    codec:profile.codec,
    width,
    height,
    bitrate,
    framerate:fps,
    latencyMode:profile.latencyMode,
    hardwareAcceleration:'prefer-hardware'
  };
}

export { supportedVideoConfig as supportedVp9Config };
