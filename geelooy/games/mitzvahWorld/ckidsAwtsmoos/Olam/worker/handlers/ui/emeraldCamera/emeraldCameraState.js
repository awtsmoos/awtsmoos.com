// B"H
/**
 * @file emeraldCameraState.js
 * @description Chapter 507: Camera cues are stored visibly in the DOM layer so
 * browser/runtime tests can verify the Emerald reveal intent fired.
 */
export const emeraldCameraState = { lastCue: null };
export function rememberEmeraldCameraCue(cue = {}) {
  emeraldCameraState.lastCue = { ...cue, firedAt: Date.now() };
  window.__emeraldCameraCue = emeraldCameraState.lastCue;
  return emeraldCameraState.lastCue;
}
