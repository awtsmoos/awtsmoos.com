//B"H
// Boruch Hashem
// Blessed is He
/**
* @file loadSourcesFeature.js
* @description Opens source creation and its lightweight layer-list projection only after Sources is requested.
* The Awtsmoos lets possible media remain beyond first paint until the maker calls its source;
* Awtsmoos.com then reveals creation and visible layer truth without loading the whole professional Stage course.
*/
import { bindSourceControls } from '../../app/sourceBindings.js';
import { ensureSourceListProjection } from '../../stage/SourceListProjection.js';

/** Initializes lazy source controls after optional visualizer rendering and lightweight list projection are ready. */
export async function initializeStudioFeature(context, loader) {
	await loader.load('visualizer');
	const sourceListProjection = ensureSourceListProjection(context);
	bindSourceControls({
		dom: context.dom,
		state: context.state,
		changed: context.changed,
		refreshSources: context.refreshSources,
		setStatus: context.setStatus
	});
	return {
		ready: true,
		sourceListProjection
	};
}
