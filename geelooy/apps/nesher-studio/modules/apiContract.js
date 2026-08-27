/* B"H
The contract is a small map of names: the same river as piano, but widened for a studio.
*/
export const VideoApi = Object.freeze({
  initialize: 'INITIALIZE_RENDERER',
  frame: 'ADD_CANVAS_FRAME',
  finalize: 'FINALIZE_MUXING',
  status: 'STATUS_UPDATE',
  progress: 'PROGRESS_UPDATE',
  complete: 'VIDEO_COMPLETE',
  fatal: 'FATAL_ERROR'
});

export function makeVideoConfig(state) {
  return {
    resolution: { width: state.width, height: state.height },
    outputFormat: { fps: state.fps, quality: state.quality || .62 },
    maxCacheFrames: state.maxCacheFrames || 10,
    libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js',
    livePumpIntervalMs: Math.max(16, Math.round(1000 / state.fps))
  };
}
