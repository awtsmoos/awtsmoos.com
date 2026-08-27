/* B"H
Canvas binding chapter: size is a garment, the frame clock is heartbeat.
No button here owns the studio; it only opens room for revealed pixels.
*/
import { createExportPlan } from '../nle/exportPlan.js';
import { renderNle } from '../nle/renderNle.js';
import { bindSizeControls } from '../recording/sizeControls.js';

export function bindCanvasSizing({ dom, state, resizeStage, setStatus }) {
  bindSizeControls({ dom, state, resizeStage, createExportPlan, renderNle, setStatus });
}

export function startStageClock({ state, drawStage, fps = 30 }) {
  return setInterval(() => drawStage(state), 1000 / fps);
}
