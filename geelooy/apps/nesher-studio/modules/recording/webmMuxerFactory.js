/* B"H
Manual WebM muxer factory: WebCodecs chunks enter one container by our own hand.
VP8 speed and VP9 quality share the same vessel without any browser recorder.
*/
const WEBM_MUXER_URL = 'https://esm.sh/webm-muxer@5.1.2?bundle';

export async function createWebmMuxer({ width, height, fps, video, audio } = {}) {
  const { Muxer, ArrayBufferTarget } = await import(WEBM_MUXER_URL);
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video:{ codec:video.muxCodec, width, height, frameRate:fps },
    ...(audio?.active ? { audio:{ codec:'A_OPUS', sampleRate:audio.sampleRate, numberOfChannels:audio.numberOfChannels } } : {}),
    firstTimestampBehavior:'offset'
  });
  return { muxer, target };
}

export function finalizeWebmTarget(target, codecs = 'vp8') {
  return new Blob([target.buffer], { type:`video/webm;codecs=${codecs}` });
}

export function codecString(videoMimeCodec, audioActive) {
  return audioActive ? `${videoMimeCodec},opus` : videoMimeCodec;
}
