/* B"H
Container support probe: containers are promises only after muxing paths are proven.
*/
export function createContainerSupportReport({ webm = true, mp4 = false, hls = true, mediabunny = false } = {}) {
  return { webm, mp4, hls, mediabunny, stableDefault:webm ? 'webm' : null };
}
export function canUseContainer(report, id) { return !!report?.[id]; }
