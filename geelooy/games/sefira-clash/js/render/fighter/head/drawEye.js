/**
 * B"H
 * Eye compatibility wrapper.
 *
 * The old head renderer still calls drawEye; this now delegates to the full eye
 * system so gaze, blink, panic, hunt, and damage are active.
 */
import { drawEyes } from '../eyes/drawEyes.js';
export function drawEye(ctx, f, x, y, color, language) {
  drawEyes(ctx, f, x, y, color, language);
}
