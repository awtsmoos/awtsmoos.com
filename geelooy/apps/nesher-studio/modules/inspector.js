/* B"H
 * Inspector conductor: crop, transform, metadata, and visualizer panels stay split.
 */
import { selectedSource } from './graph/sceneGraph.js';
import { bindCropInspector, syncCropInspector } from './inspector/cropInspector.js';
import { renderInspectorMeta } from './inspector/metaInspector.js';
import { bindTransformInspector, setInspectorDisabled, syncTransformInspector } from './inspector/transformInspector.js';
import { refreshVisualizerInspector } from './visualizer/visualizerInspector.js';
import { dom } from './dom.js';

export function refreshInspector(state) {
  const source = selectedSource(state);
  renderInspectorMeta(dom, source); setInspectorDisabled(dom, !source);
  syncCropInspector(dom, source); syncTransformInspector(dom, source, state);
  refreshVisualizerInspector(state, source);
}

export function bindCropControls(state, afterChange) {
  const refresh = () => refreshInspector(state);
  bindCropInspector({ dom, state, afterChange, refresh });
  bindTransformInspector({ dom, state, afterChange, refresh });
}
