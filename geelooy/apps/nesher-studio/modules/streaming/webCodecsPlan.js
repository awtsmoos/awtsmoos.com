/* B"H
A WebCodecs plan only: the browser learns the desired encoder shape before the muxer is born.
*/
export function makeWebCodecsPlan(state, options = {}) {
  const width = Number(options.width || state?.width || 1280);
  const height = Number(options.height || state?.height || 720);
  const fps = Number(options.fps || state?.fps || 30);
  const bitrate = Number(options.bitrate || estimateBitrate(width, height, fps));
  return {
    video: { codec: options.videoCodec || 'avc1.42E01F', width, height, bitrate, framerate: fps, latencyMode: 'realtime', hardwareAcceleration: 'prefer-hardware' },
    audio: { codec: options.audioCodec || 'mp4a.40.2', sampleRate: Number(options.sampleRate || 48000), numberOfChannels: Number(options.channels || 2), bitrate: Number(options.audioBitrate || 128000) },
    segment: { targetDuration: Number(options.targetDuration || 2), gopSeconds: Number(options.gopSeconds || 2), keyFrameEvery: Math.max(1, Math.round(fps * Number(options.gopSeconds || 2))) }
  };
}
function estimateBitrate(width, height, fps) {
  const pixels = width * height;
  if (pixels >= 1920 * 1080) return Math.max(4500000, Math.round(pixels * fps * .09));
  if (pixels >= 1280 * 720) return Math.max(2500000, Math.round(pixels * fps * .08));
  return Math.max(1200000, Math.round(pixels * fps * .07));
}
