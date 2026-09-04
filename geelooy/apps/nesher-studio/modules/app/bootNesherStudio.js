//B"H
// Boruch Hashem
// Blessed is He
/**
* @file bootNesherStudio.js
* @description Awakens mounted DOM, critical Canvas, command core, and lazy-loading gates while deeper Studio chambers stay outside first paint.
* The Awtsmoos reveals one living Canvas only after its shell exists, before Audio, Timeline, streams, codecs, inspector depth, or AI descend;
* Awtsmoos.com keeps first light quick and truthful, then lets explicit intention summon every richer world around the same project friend.
*/
import { installCreativeRuntime } from '../creative/runtime/installCreativeRuntime.js';
import {
	dom,
	initializeStudioDom,
	setStatus,
	setStreamHealth
} from '../dom.js';
import { createStudioFeatureContext } from '../loading/StudioFeatureContext.js';
import { StudioFeatureLoader } from '../loading/StudioFeatureLoader.js';
import { bindStudioIntentPrefetch } from '../loading/StudioIntentPrefetch.js';
import { bindStudioMovieAiDemand } from '../loading/StudioMovieAiDemand.js';
import { schedulePostCanvasWarmup } from '../loading/StudioPostCanvasWarmup.js';
import { bindStudioRecordingDemand } from '../loading/StudioRecordingDemand.js';
import {
	bindDragging,
	drawStage,
	refreshSources,
	resizeStage
} from '../stage.js';
import { createState } from '../state.js';
import { bindCreativeInterface } from './bindCreativeInterface.js';
import { startStageClock } from './stageClock.js';
import { bindViewportControls } from './viewportBindings.js';

/** Boots the critical AWTSMOOS STUDIO surface and returns the one shared runtime state. */
export function bootNesherStudio() {
	initializeStudioDom();
	const state = createState();
	const changed = (message) => {
		refreshStudio(state, message);
	};
	const creativeRuntime = installCreativeRuntime(state, {
		refresh: () => {
			refreshCreativeSurfaces(state);
			publishCreativeEvidenceChanged();
		}
	});
	const featureContext = createStudioFeatureContext({
		state,
		api: creativeRuntime.api,
		changed,
		tunnelBase: readTunnelBase()
	});
	const featureLoader = new StudioFeatureLoader(featureContext);

	resizeStage(state);
	bindDragging(state);
	refreshSources(state);
	setStreamHealth();
	bindViewportControls({ dom });
	bindCreativeInterface({
		dom,
		state,
		api: creativeRuntime.api,
		featureLoader,
		setStatus
	});
	bindStudioIntentPrefetch({
		dom,
		featureLoader
	});
	bindStudioRecordingDemand({
		dom,
		featureLoader,
		setStatus
	});
	bindStudioMovieAiDemand(featureLoader);
	startStageClock({
		state,
		drawStage
	});
	schedulePostCanvasWarmup(featureLoader);
	return state;
}

/** Redraws critical creative surfaces and reports the human-readable mutation status. */
function refreshStudio(state, message) {
	refreshCreativeSurfaces(state);
	setStatus(message);
}

/** Refreshes only critical Stage projection and Canvas drawing. */
function refreshCreativeSurfaces(state) {
	refreshSources(state);
	drawStage(state);
}

/** Notifies an already-loaded Commands & History room that command evidence changed. */
function publishCreativeEvidenceChanged() {
	if (
		typeof globalThis.dispatchEvent !== 'function'
		|| typeof globalThis.CustomEvent !== 'function'
	) {
		return;
	}
	globalThis.dispatchEvent(
		new globalThis.CustomEvent('awtsmoos-studio:creative-evidence-changed')
	);
}

/** Reads the optional tunnel media base without embedding local transport into feature code. */
function readTunnelBase() {
	return new URLSearchParams(location.search).get('tunnelBase') || undefined;
}
