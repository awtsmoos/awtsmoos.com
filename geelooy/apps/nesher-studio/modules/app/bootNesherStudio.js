/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos creates each controller in its proper order; Awtsmoos.com awakens the fixed viewport, compact decks, audio field, recording, streaming, and timeline without one room carrying every nerve.
*/
import { bindAudioLab } from '../audioLab/bindAudioLab.js';
import { dom, setProviderUi, setStatus, setStreamHealth } from '../dom.js';
import { bindEncodingBenchmarkPanel } from '../encodingBenchmark/benchmarkPanel.js';
import { bindCropControls } from '../inspector.js';
import { renderNle } from '../nle/renderNle.js';
import { bindScenes } from '../scenes.js';
import { bindDragging, drawStage, refreshSources, resizeStage } from '../stage.js';
import { createState } from '../state.js';
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
import { bindViewportControls } from './viewportBindings.js';

export function bootNesherStudio() {
	const state = createState();
	const changed = (message) => refreshStudio(state, message);

	ensureNleState(state);
	resizeStage(state);
	bindDragging(state);
	bindScenes(state);
	refreshSources(state);
	setupRecordingProfiles({ dom, state });
	setupProviders({ dom, state, setProviderUi });
	bindCanvasSizing({ dom, state, resizeStage, setStatus });
	bindCropControls(state, changed);
	bindVisualizerControls(state, changed);
	bindEncodingBenchmarkPanel({ dom, state, setStatus });
	renderNle(state, dom);
	setStreamHealth();
	bindSourceControls({ dom, state, changed, setStatus });
	bindLayerControls({ dom, state, changed });
	bindRecordingControls({ dom, state });
	bindProviderControls({ dom, state, setProviderUi });
	bindNleControls({ dom, state, setStatus });
	bindAudioLab({ dom, state, changed, setStatus });
	bindViewportControls({ dom });
	bindNavigation({ dom, setStatus });
	createGenericHlsController(createStreamVessel(state)).bind();
	startStageClock({ state, drawStage });
	return state;
}

function createStreamVessel(state) {
	return { dom, state, setStatus, setStreamHealth, drawStage, tunnelBase: readTunnelBase() };
}

function refreshStudio(state, message) {
	refreshSources(state);
	drawStage(state);
	setStatus(message);
}

function readTunnelBase() {
	return new URLSearchParams(location.search).get('tunnelBase') || undefined;
}
