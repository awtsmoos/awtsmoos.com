/* B"H
WebM muxer factory: video and optional Opus audio enter one container.
A small ark for pixels and breath, built only after the stream has been measured.
*/
const WEBM_MUXER_URL = 'https://esm.sh/webm-muxer@5.1.2?bundle';

export async function createWebmMuxer({ width, height, fps, audio } = {}) {
  const { Muxer, ArrayBufferTarget } = await import(WEBM_MUXER_URL);
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video:{ codec:'V_VP9', width, height, frameRate:fps },
    ...(audio?.active ? { audio:{ codec:'A_OPUS', sampleRate:audio.sampleRate, numberOfChannels:audio.numberOfChannels } } : {}),
    firstTimestampBehavior:'offset'
  });
  return { muxer, target };
}

export function finalizeWebmTarget(target, codecs = 'vp9') {
  return new Blob([target.buffer], { type:`video/webm;codecs=${codecs}` });
}
