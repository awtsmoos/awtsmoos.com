/* B"H
Layer bindings: ascent, descent, duplication, and removal without a throne in main.
Each layer is a rung; the Awtsmoos is the ladder appearing from nothing.
*/
import { duplicateSelected, moveSelected, moveSelectedBottom, moveSelectedTop, removeSelected } from '../layers.js';

export function bindLayerControls({ dom, state, changed }) {
  const run = (action, okMessage) => layerAction({ action, okMessage, changed });
  dom.layerTop.onclick = () => run(() => moveSelectedTop(state), 'Source moved to top.');
  dom.layerUp.onclick = () => run(() => moveSelected(state, 1), 'Layer moved up.');
  dom.layerDown.onclick = () => run(() => moveSelected(state, -1), 'Layer moved down.');
  dom.layerBottom.onclick = () => run(() => moveSelectedBottom(state), 'Source moved to bottom.');
  dom.duplicateSource.onclick = () => run(() => duplicateSelected(state), 'Source duplicated.');
  dom.removeSource.onclick = () => run(() => removeSelected(state), 'Source removed.');
}

function layerAction({ action, okMessage, changed }) {
  const ok = action();
  changed(ok ? okMessage : 'Choose a source first, or the action is unavailable.');
}
