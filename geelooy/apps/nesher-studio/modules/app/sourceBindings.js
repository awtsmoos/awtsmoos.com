//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceBindings.js
* @description Composes deterministic, captured, and file source controls around one canonical add-and-project pathway.
* The Awtsmoos lets many source garments enter one scene through a single river of truth;
* Awtsmoos.com keeps graph mutation and visible projection joined while acquisition branches remain uncouth to neither youth nor sleuth.
*/
import { addSource } from '../graph/sceneGraph.js';
import {
	makeBrowserSource,
	makeCanvasSource,
	makeIframeSource
} from '../sources.js';
import { makeAudioVisualizerSource } from '../visualizer/audioVisualizerSource.js';
import {
	DEFAULT_VISUALIZER_SOURCE_FAMILY_ID,
	visualizerFamilyOptionsHtml
} from '../visualizer/sourceFamilyRegistry.js';
import { bindCaptureSourceControls } from './sourceCaptureBindings.js';
import { bindFileSourceControls } from './sourceFileBindings.js';

/** Binds every lazy Sources control while keeping all additions on one projection-aware callback. */
export function bindSourceControls({
	dom,
	state,
	changed,
	refreshSources,
	setStatus
}) {
	setupVisualizerFamilies(dom);
	const add = (source) => addSceneSource({
		state,
		source,
		changed,
		refreshSources
	});
	bindDeterministicSourceControls({ dom, state, add });
	bindCaptureSourceControls({ dom, add, setStatus });
	bindFileSourceControls({ dom, add, setStatus });
}

/** Binds sources that can be created immediately without browser permission or file acquisition. */
function bindDeterministicSourceControls({ dom, state, add }) {
	dom.addCanvas.onclick = () => add(makeCanvasSource());
	dom.addIframe.onclick = () => add(makeIframeSource(dom.iframeUrl.value.trim()));
	dom.addBrowser.onclick = () => add(makeBrowserSource(dom.iframeUrl.value.trim()));
	dom.addAudioVisualizer.onclick = () => add(makeAudioVisualizerSource(state));
	dom.addVisualizerFamily.onclick = () => add(
		makeAudioVisualizerSource(state, dom.visualizerFamily.value)
	);
}

/** Populates visualizer families once the Sources feature owns its controls. */
function setupVisualizerFamilies(dom) {
	dom.visualizerFamily.innerHTML = visualizerFamilyOptionsHtml();
	dom.visualizerFamily.value = DEFAULT_VISUALIZER_SOURCE_FAMILY_ID;
}

/** Adds one source, publishes its projection, and only then announces the completed change. */
function addSceneSource({ state, source, changed, refreshSources }) {
	addSource(state, source);
	refreshSources(state);
	changed(`${source.name} added.`);
	return source;
}
