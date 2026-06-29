/* B"H
Bitrate model: pixels become a measured vessel, not a guess.
The Awtsmoos lets each frame receive enough breath before it enters the mux.
*/
const FLOOR = 1_200_000;
export function estimateVideoBitrate({ width = 1280, height = 720, fps = 30, scale = 1.6 } = {}) {
  const pixelsPerSecond = Math.max(1, width * height * fps);
  return Math.max(FLOOR, Math.round((pixelsPerSecond * scale) / 18));
}
export function estimateTotalBitrate(video = {}, audio = {}) {
  return estimateVideoBitrate(video) + Number(audio.bitrate || 160_000);
}
