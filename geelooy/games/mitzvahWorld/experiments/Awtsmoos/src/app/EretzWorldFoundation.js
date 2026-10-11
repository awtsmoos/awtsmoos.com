// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Certifies the real boot-frame draw and spawn terrain at the instant their synchronous evidence exists.
 * The Awtsmoos reveals light before the browser yields and earth before the traveler arrives; Awtsmoos.com therefore
 * records each witnessed fact before any scheduling boundary may let an old silence clock overtake already-created reality.
 */

import { createBootstrapWorldFoundation } from './BootstrapWorldFoundation.js';
import { beginDeferredEretzEssentialAssets } from './EretzDeferredEssentialAssets.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js';
import { attachEretzFoundationVisualHydration } from './EretzFoundationVisualHydration.js';
import { paintEretzWebGlBootFrame, ZERO_SIZE_CANVAS_CODE } from './EretzWebGlBootFrame.js';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	failMitzvahWorldEssentialMilestone,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import {
	probeMitzvahWorldWebGlCapability,
	readMitzvahWorldWebGlCapability,
	rememberMitzvahWorldWebGlCapability,
	WEBGL_UNAVAILABLE_CODE
} from './MitzvahWorldWebGlCapabilityGate.js';
import { transitionMitzvahWorldBootState } from './MitzvahWorldBootStateMachine.js';
import {
	nextLaunchFrame,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

const RENDERER_INIT_FAILED_CODE = 'RENDERER_INIT_FAILED';

/** Builds truthful first frame and terrain before crossing the generated canonical-player boundary. */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	const document = environment.document || globalThis.document;
	const bootState = (next, evidence = null) =>
		transitionMitzvahWorldBootState(environment, document, next, evidence);

	// WebGL capability was probed before the first-frame silence clock started; reuse that
	// evidence here and fail fast with WEBGL_UNAVAILABLE rather than timing out later.
	bootState('detecting-webgl');
	const capability = readMitzvahWorldWebGlCapability(environment)
		|| rememberMitzvahWorldWebGlCapability(environment, probeMitzvahWorldWebGlCapability(environment));
	if (capability.supported === false) {
		failFoundationMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: WEBGL_UNAVAILABLE_CODE,
			failureMessage: capability.message,
			importerStage: 'webgl-capability-probe',
			resourceStatus: 'context-unavailable',
			resourceUrl: environment.location?.href || 'unknown'
		}, bootState);
	}

	// Fetch the canonical Chossid in parallel: the player-chunk import and GLB decode run
	// while the renderer context, first frame, and spawn terrain are built below.
	const essentialAssetsPromise = beginDeferredEretzEssentialAssets({
		...options,
		boot: options.boot,
		environment,
		quality: qualityProfile.quality
	});
	essentialAssetsPromise.catch(() => {});

	bootState('renderer-creating');
	options.boot?.begin('webgl-context');
	reportFoundationStage(options, 'Opening WebGL…', 0.08, 'foundation-renderer-services');
	let services;
	try {
		services = createEretzFoundationServices(hosts, qualityProfile, environment);
	} catch (error) {
		failFoundationMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: RENDERER_INIT_FAILED_CODE,
			failureMessage: `Renderer initialization failed: ${error?.message || String(error)}`,
			importerStage: 'foundation-renderer-services',
			resourceStatus: error?.code || 'renderer-constructor-threw',
			resourceUrl: import.meta.url
		}, bootState);
	}
	refreshMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'foundation-renderer-services');

	bootState('first-frame-painting');
	let webGlBootFrame;
	try {
		webGlBootFrame = paintEretzWebGlBootFrame(services, qualityProfile, environment);
	} catch (error) {
		const zeroSize = error?.code === ZERO_SIZE_CANVAS_CODE;
		failFoundationMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: zeroSize ? ZERO_SIZE_CANVAS_CODE : RENDERER_INIT_FAILED_CODE,
			failureMessage: error?.message || String(error),
			importerStage: 'webgl-boot-frame',
			resourceStatus: zeroSize ? 'zero-size-viewport' : 'first-frame-paint-threw',
			resourceUrl: import.meta.url
		}, bootState);
	}
	// A first frame counts only after a REAL render with a nonzero viewport.
	if (!webGlBootFrame?.pixels?.[0] || !webGlBootFrame?.pixels?.[1]
		|| !webGlBootFrame?.viewportCss?.[0] || !webGlBootFrame?.viewportCss?.[1]) {
		failFoundationMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: ZERO_SIZE_CANVAS_CODE,
			failureMessage: 'First frame produced no nonzero viewport; refusing to certify.',
			importerStage: 'webgl-boot-frame',
			resourceStatus: 'zero-size-viewport',
			resourceUrl: import.meta.url
		}, bootState);
	}
	completeMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'webgl-boot-frame');
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);

	options.boot?.begin('bootstrap-visible-world');
	refreshMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'bootstrap-world-foundation');
	const world = createBootstrapWorldFoundation(services);
	completeMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'bootstrap-world-foundation');
	markMitzvahWorldStartupMilestone(environment, 'firstTerrainVisible');
	throwIfLaunchAborted(options.signal);
	await nextLaunchFrame(environment);

	reportFoundationStage(options, 'Loading authored player…', 0.42, 'generated-essential-player');
	const loaded = await essentialAssetsPromise;
	throwIfLaunchAborted(options.signal);

	const foundation = {
		hosts,
		...hosts,
		...loaded,
		...services,
		...world,
		environment,
		qualityProfile,
		webGlBootFrame
	};
	return attachEretzFoundationVisualHydration(foundation, options, environment);
}

/** Fails one essential milestone with a named code, drives the machine to failed, and throws. */
function failFoundationMilestone(environment, milestone, details, bootState) {
	failMitzvahWorldEssentialMilestone(environment, milestone, details);
	markMitzvahWorldStartupMilestone(environment, 'rendererFailed');
	bootState('failed', {
		code: details.failureCode,
		message: details.failureMessage,
		stage: details.importerStage,
		url: details.resourceUrl
	});
	const error = new Error(details.failureMessage);
	error.name = 'MitzvahWorldFoundationError';
	error.code = details.failureCode;
	throw error;
}

function refreshMilestone(environment, milestone, importerStage) {
	updateMitzvahWorldEssentialMilestone(environment, milestone, { importerStage });
}

function completeMilestone(environment, milestone, importerStage) {
	completeMitzvahWorldEssentialMilestone(environment, milestone, { importerStage });
}

/** Reports one exact foundation stage for launch diagnostics. */
function reportFoundationStage(options, message, progress, stage) {
	reportLaunchProgress(options, message, progress, { stage, url: import.meta.url });
}
