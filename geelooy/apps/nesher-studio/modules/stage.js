/* B"H
Stage interaction: transform and crop become real tools instead of text boxes alone.
The editor touches the canvas; the source answers with position, scale, or crop.
*/
import { dom, ctx } from './dom.js';
import { refreshInspector } from './inspector.js';
import { renderScene } from './renderers/sceneRenderer.js';
import { beginStageDrag, endStageDrag, keyMoveSelected, moveStageDrag } from './stage/stageDrag.js';
import { appendSourceRows } from './stage/stageSourceRows.js';

export function resizeStage(state) { dom.stage.width = state.width; dom.stage.height = state.height; drawStage(state); }
export function drawStage(state, options = {}) { state.stageTool ||= 'transform'; renderScene(ctx, state, options); }
export function refreshSources(state) { appendSourceRows({ dom, state, drawStage, refreshSources }); refreshInspector(state); }
export function bindDragging(state) {
  state.stageTool ||= 'transform';
  dom.stage.addEventListener('pointerdown', event => { beginStageDrag(state, event, dom.stage); drawStage(state); refreshSources(state); });
  dom.stage.addEventListener('pointermove', event => { if (moveStageDrag(state, event, dom.stage)) { drawStage(state); refreshSources(state); } });
  window.addEventListener('pointerup', () => endStageDrag(state));
  window.addEventListener('keydown', event => { if (keyMoveSelected(state, event)) { drawStage(state); refreshSources(state); } });
}
