/* B"H
HLS output: Binah shapes Mediabunny's Output, CanvasSource, and target callbacks.
*/
import { captureHlsPath } from './hlsCapture.js';
export function createHlsOutput({ mb, canvas, bitrate, targetDuration, state, tunnel }) {
  const chesedSource = new mb.CanvasSource(canvas, { codec:'avc', bitrate, keyFrameInterval:targetDuration });
  const malchusTarget = new mb.PathedTarget('master.m3u8', ({ path }) => new mb.BufferTarget({ onFinalize:buffer => captureHlsPath({ path, buffer, state, tunnel }) }));
  const tiferesOutput = new mb.Output({ format:new mb.HlsOutputFormat({ segmentFormat:new mb.MpegTsOutputFormat(), targetDuration, live:true, maxLiveSegmentCount:6 }), target:malchusTarget });
  tiferesOutput.addVideoTrack(chesedSource);
  return { output:tiferesOutput, source:chesedSource };
}
