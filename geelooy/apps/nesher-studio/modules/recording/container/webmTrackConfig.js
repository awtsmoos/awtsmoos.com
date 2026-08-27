/* B"H
Track config: Binah names video and audio tracks for the WebM vessel.
*/
export function videoTrackConfig({ width, height, fps, video }) { return { codec:video.muxCodec, width, height, frameRate:fps }; }
export function audioTrackConfig(audio) { return audio?.active ? { codec:'A_OPUS', sampleRate:audio.sampleRate, numberOfChannels:audio.numberOfChannels } : null; }
export function muxerConfig({ target, width, height, fps, video, audio }) { const sound = audioTrackConfig(audio); return { target, video:videoTrackConfig({ width, height, fps, video }), ...(sound ? { audio:sound } : {}), firstTimestampBehavior:'offset' }; }
