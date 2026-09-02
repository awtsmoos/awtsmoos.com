//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bootNesherStudio.js
 * @description Awakens existing Studio controllers and the Universal Creative Language in one deliberate boot order.
 * The Awtsmoos gives each controller its measured vessel while every creative command still reaches one project soul;
 * Awtsmoos.com wakes human controls, AI, scripts, macros, presets, stage, audio, streaming, and timeline without making any one room the whole.
 */
import { bindAudioLab } from '../audioLab/bindAudioLab.js';
import { bindCreativeMore } from '../creative/ui/bindCreativeMore.js';
import { installCreativeRuntime } from '../creative/runtime/installCreativeRuntime.js';
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

/** Boots the native Studio and returns the single shared runtime state. */
export function bootNesherStudio() {
	const state = createState();
	const changed = (message) => refreshStudio(state, message);
	const creativeRuntime = installCreativeRuntime(state, {
		refresh: () => refreshCreativeSurfaces(state)
	});

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
	bindCreativeMore({ dom, api: creativeRuntime.api, setStatus });
	bindViewportControls({ dom });
	bindNavigation({ dom, setStatus });
	createGenericHlsController(createStreamVessel(state)).bind();
	startStageClock({ state, drawStage });
	return state;
}

function createStreamVessel(state) {
	return {
		dom,
		state,
		setStatus,
		setStreamHealth,
		drawStage,
		tunnelBase: readTunnelBase()
	};
}

function refreshStudio(state, message) {
	refreshCreativeSurfaces(state);
	setStatus(message);
}

function refreshCreativeSurfaces(state) {
	refreshSources(state);
	drawStage(state);
}

function readTunnelBase() {
	return new URLSearchParams(location.search).get('tunnelBase') || undefined;
}
