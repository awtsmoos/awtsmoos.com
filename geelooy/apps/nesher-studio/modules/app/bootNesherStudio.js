/* B"H
 * Boot chapter: the studio awakens like an eagle whose limbs know their shlichus.
 */
import { createState } from '../state.js';
import { dom, setStatus, setStreamHealth, setProviderUi } from '../dom.js';
import { bindDragging, drawStage, refreshSources, resizeStage } from '../stage.js';
import { bindScenes } from '../scenes.js';
import { bindCropControls } from '../inspector.js';
import { bindEncodingBenchmarkPanel } from '../encodingBenchmark/benchmarkPanel.js';
import { renderNle } from '../nle/renderNle.js';
import { bindVisualizerControls } from '../visualizer/visualizerInspector.js';
import { bindCanvasSizing, startStageClock } from './canvasBindings.js';
import { createGenericHlsController } from './genericHlsController.js';
import { bindLayerControls } from './layerBindings.js';
import { bindNavigation } from './navigationBindings.js';
import { bindNleControls } from './nleBindings.js';
import { ensureNleState } from './nleState.js';
import { bindProviderControls, setupProviders } from './providerBindings.js';
import { bindRecordingControls, setupRecordingProfiles } from './recordingBindings.js';
import { bindSourceControls } from './sourceBindings.js';

export function bootNesherStudio() {
  const state = createState(), changed = message => refreshStudio(state, message);
  ensureNleState(state); resizeStage(state); bindDragging(state); bindScenes(state); refreshSources(state);
  setupRecordingProfiles({ dom, state }); setupProviders({ dom, state, setProviderUi }); bindCanvasSizing({ dom, state, resizeStage, setStatus });
  bindNavigation({ dom, setStatus }); bindCropControls(state, changed); bindVisualizerControls(state, changed); bindEncodingBenchmarkPanel({ dom, state, setStatus });
  renderNle(state, dom); setStreamHealth(); bindSourceControls({ dom, state, changed, setStatus }); bindLayerControls({ dom, state, changed });
  bindRecordingControls({ dom, state }); bindProviderControls({ dom, state, setProviderUi }); bindNleControls({ dom, state, setStatus });
  createGenericHlsController(createStreamVessel(state)).bind(); startStageClock({ state, drawStage }); return state;
}
function createStreamVessel(state) { return { dom, state, setStatus, setStreamHealth, drawStage, tunnelBase:readTunnelBase() }; }
function refreshStudio(state, message) { refreshSources(state); drawStage(state); setStatus(message); }
function readTunnelBase() { return new URLSearchParams(location.search).get('tunnelBase') || undefined; }
