//B"H
// Boruch Hashem
// Blessed is He
/**
* @file loadStageWorkstationFeature.js
* @description Awakens professional Stage inspection while layer controls dispatch the same public commands shared by every operator.
* The Awtsmoos lets Canvas appear before its measuring instruments descend into view;
* Awtsmoos.com joins inspector depth and command-driven layer intent to one shared projection without duplicate truth anew.
*/
import { bindLayerControls } from '../../app/layerBindings.js';
import { bindCropControls, refreshInspector } from '../../inspector.js';
import { bindSizeControls } from '../../recording/sizeControls.js';
import { bindScenes } from '../../scenes.js';
import { ensureSourceListProjection } from '../../stage/SourceListProjection.js';
import { bindVisualizerControls } from '../../visualizer/visualizerInspector.js';

/** Initializes professional Stage controls and registers only the inspector projection unique to this room. */
export async function initializeStudioFeature(context, loader) {
	await loader.load('visualizer');
	bindCropControls(context.state, context.changed);
	bindVisualizerControls(context.state, context.changed);
	bindLayerControls({
		dom: context.dom,
		state: context.state,
		api: context.api,
		drawStage: context.drawStage,
		refreshSources: context.refreshSources,
		refreshInspector,
		setStatus: context.setStatus
	});
	bindScenes(context.state, context.api);
	bindSizeControls({
		dom: context.dom,
		state: context.state,
		resizeStage: context.resizeStage,
		setStatus: context.setStatus
	});
	bindDeferredBenchmark(context, loader);
	const sourceListProjection = ensureSourceListProjection(context);
	const refresh = () => refreshInspector(context.state);
	const unregister = context.registerStageProjection?.(refresh) || null;
	refresh();
	return {
		refresh,
		unregister,
		sourceListProjection
	};
}

/** Delays WebCodecs benchmark imports until the maker invokes one benchmark control. */
function bindDeferredBenchmark(context, loader) {
	for (const button of [
		context.dom.runEncodingBenchmark,
		context.dom.runSmokeEncodingBenchmark
	]) {
		bindDeferredButton(button, loader);
	}
}

/** Replays the first benchmark click after its deep feature chamber has initialized. */
function bindDeferredButton(button, loader) {
	if (!button) {
		return;
	}
	let ready = false;
	button.addEventListener('pointerenter', () => {
		loader.preload('benchmark').catch(() => {});
	}, {
		passive: true
	});
	button.addEventListener('click', async (event) => {
		if (ready) {
			return;
		}
		event.preventDefault();
		event.stopImmediatePropagation();
		await loader.load('benchmark');
		ready = true;
		button.click();
	});
}
