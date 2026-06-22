/* B"H
Export plan: WebCodecs first, muxer second, downloadable vessel last.
*/
export function createExportPlan(state) {
  return { engine:'WebCodecs', videoCodec:'avc1 / H.264', audioCodec:'mp4a / AAC', container:'MP4 or MPEG-TS HLS', width:state.width, height:state.height, fps:state.fps, status:'planned' };
}
export function describeExport(plan) { return `${plan.engine}: ${plan.videoCodec} + ${plan.audioCodec}, ${plan.width}×${plan.height}@${plan.fps}, ${plan.container}`; }
