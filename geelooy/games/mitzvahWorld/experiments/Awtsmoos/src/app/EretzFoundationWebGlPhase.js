// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationWebGlPhase.js
 * @description Preserves honest WebGL, visible spawn-earth, and named failure milestones before enrichment.
 * The Awtsmoos paints the first real frame beneath the sky before any expensive glory;
 * Awtsmoos.com guards the Chossid's future step by checking every witnessed story.
 */

import { createBootstrapWorldFoundation } from './BootstrapWorldFoundation.js';
import { failEretzFoundationBoot } from './EretzFoundationBootFailure.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js';
import { paintEretzWebGlBootFrame, ZERO_SIZE_CANVAS_CODE } from './EretzWebGlBootFrame.js';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
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
import { reportLaunchProgress, throwIfLaunchAborted } from './RuntimeLaunchProgress.js';

const RENDERER_INIT_FAILED_CODE = 'RENDERER_INIT_FAILED';

/** Creates a genuine first framebuffer and terrain before any async shader prewarm begins. */
export function prepareEretzFoundationWebGlPhase(hosts, options, environment) {
	const quality = options.qualityProfile;
	const document = environment.document || globalThis.document;
	const bootState = (next, evidence = null) =>
		transitionMitzvahWorldBootState(environment, document, next, evidence);
	bootState('detecting-webgl');
	const capability = readMitzvahWorldWebGlCapability(environment)
		|| rememberMitzvahWorldWebGlCapability(environment, probeMitzvahWorldWebGlCapability(environment));
	if (capability.supported === false) {
		failEretzFoundationBoot(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: WEBGL_UNAVAILABLE_CODE,
			failureMessage: capability.message,
			importerStage: 'webgl-capability-probe',
			resourceStatus: 'context-unavailable',
			resourceUrl: environment.location?.href || 'unknown'
		}, bootState);
	}
	bootState('renderer-creating');
	options.boot?.begin('webgl-context');
	reportLaunchProgress(options, 'Opening WebGL…', 0.08, {
		stage: 'foundation-renderer-services', url: import.meta.url
	});
	updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
		importerStage: 'foundation-renderer-services'
	});
	let services;
	try {
		services = createEretzFoundationServices(hosts, quality, environment);
	} catch (error) {
		failEretzFoundationBoot(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: RENDERER_INIT_FAILED_CODE,
			failureMessage: `Renderer initialization failed: ${error?.message || String(error)}`,
			importerStage: 'foundation-renderer-services',
			resourceStatus: error?.code || 'renderer-constructor-threw',
			resourceUrl: import.meta.url
		}, bootState);
	}
	updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
		importerStage: 'foundation-renderer-services'
	});
	bootState('first-frame-painting');
	let webGlBootFrame;
	try {
		webGlBootFrame = paintEretzWebGlBootFrame(services, quality, environment);
	} catch (error) {
		const zero = error?.code === ZERO_SIZE_CANVAS_CODE;
		failEretzFoundationBoot(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: zero ? ZERO_SIZE_CANVAS_CODE : RENDERER_INIT_FAILED_CODE,
			failureMessage: error?.message || String(error),
			importerStage: 'webgl-boot-frame',
			resourceStatus: zero ? 'zero-size-viewport' : 'first-frame-paint-threw',
			resourceUrl: import.meta.url
		}, bootState);
	}
	if (!webGlBootFrame?.pixels?.[0] || !webGlBootFrame?.pixels?.[1]
		|| !webGlBootFrame?.viewportCss?.[0] || !webGlBootFrame?.viewportCss?.[1]) {
		failEretzFoundationBoot(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: ZERO_SIZE_CANVAS_CODE,
			failureMessage: 'First frame produced no nonzero viewport; refusing to certify.',
			importerStage: 'webgl-boot-frame',
			resourceStatus: 'zero-size-viewport',
			resourceUrl: import.meta.url
		}, bootState);
	}
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, {
		importerStage: 'webgl-boot-frame'
	});
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('bootstrap-visible-world');
	updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, {
		importerStage: 'bootstrap-world-foundation'
	});
	const world = createBootstrapWorldFoundation(services);
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, {
		importerStage: 'bootstrap-world-foundation'
	});
	markMitzvahWorldStartupMilestone(environment, 'firstTerrainVisible');
	throwIfLaunchAborted(options.signal);
	return { services, webGlBootFrame, world };
}
