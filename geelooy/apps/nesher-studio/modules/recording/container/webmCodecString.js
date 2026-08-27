/* B"H
Codec string: Tiferes binds video and audio names into one browser-readable declaration.
*/
export function codecString(videoMimeCodec, audioActive) { return audioActive ? `${videoMimeCodec},opus` : videoMimeCodec; }
