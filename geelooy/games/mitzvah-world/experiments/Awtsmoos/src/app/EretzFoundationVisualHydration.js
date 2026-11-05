// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationVisualHydration.js
 * @description Attaches post-play renderer and terrain enrichment without letting decorative hydration enter essential readiness.
 * The Awtsmoos gives first control a truthful simple garment before richer color descends;
 * Awtsmoos.com lets authored visual abundance arrive later while frame, terrain, Chossid, and movement keep their narrow covenant.
 */

import { prepareEretzEssentialVisuals } from './EretzEssentialVisualGate.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';

/** Installs deferred visual hydration on an already essential-ready foundation object. */
export function attachEretzFoundationVisualHydration(foundation, options, environment) {
	foundation.essentialVisualEvidence = deferredVisualReceipt();
	foundation.visualHydrationPromise = prepareEretzEssentialVisuals({
		boot: options.boot,
		renderer: foundation.renderer,
		signal: options.signal,
		terrain: foundation.terrain,
		worldExperience: options.worldExperience
	}).then(
		visualEvidence => {
			foundation.essentialVisualEvidence = visualEvidence;
			markVisibleWorldReady(options, visualEvidence);
			return visualEvidence;
		},
		error => {
			markVisualHydrationDegraded(options, environment, error);
			return null;
		}
	);
	markVisibleWorldReady(options, foundation.essentialVisualEvidence);
	return foundation;
}

function deferredVisualReceipt() {
	return Object.freeze({
		renderer: 'webgl',
		rendererPhase: 'bootstrap-deferred-to-post-play',
		terrainLoaded: 0,
		terrainPhase: 'deferred-to-post-play'
	});
}

function markVisibleWorldReady(options, visualEvidence) {
	const deferredTerrain = visualEvidence?.terrainPhase === 'deferred-by-world-profile'
		|| visualEvidence?.terrainPhase === 'deferred-to-post-play';
	options.boot?.progress?.(
		'bootstrap-visible-world',
		1,
		1,
		deferredTerrain
			? 'Canonical Chossid, WebGL, and bootstrap terrain are ready; authored textures are deferred.'
			: 'Canonical Chossid, rich WebGL, and authored terrain are ready.',
		'ready'
	);
}

function markVisualHydrationDegraded(options, environment, error) {
	try {
		options.boot?.progress?.(
			'bootstrap-visible-world',
			1,
			1,
			'Authored visuals deferred; bootstrap WebGL carries first play.',
			'degraded'
		);
	} catch {}
	try {
		environment.console?.warn?.(
			'[MitzvahWorld] Visual hydration degraded:',
			error?.message || error
		);
	} catch {}
}
