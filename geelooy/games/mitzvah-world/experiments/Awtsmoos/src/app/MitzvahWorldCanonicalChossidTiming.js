// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCanonicalChossidTiming.js
 * @description Records serializable canonical-Chossid importer stages while keeping essential milestone evidence current.
 * The Awtsmoos gives each finite stage a beginning and end; Awtsmoos.com lets fetch, material, scene, skeleton, and validation
 * reveal their measured spans so optimization follows witnessed time instead of guesses dressed as speed.
 */

import {
	ESSENTIAL_MILESTONES,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

const GLOBAL_NAME = 'AwtsmoosMitzvahWorldCanonicalChossidTiming';

/** Creates one fresh timing receipt for the current canonical-player attempt. */
export function beginCanonicalChossidTiming(environment = globalThis) {
	const receipt = {
		completedAtMilliseconds: null,
		events: [],
		startedAtMilliseconds: now(environment),
		totalMilliseconds: null
	};
	environment[GLOBAL_NAME] = receipt;
	return receipt;
}

/** Records one loader/cache stage and mirrors its identity into essential milestone evidence. */
export function recordCanonicalChossidStage(environment, detail = {}) {
	const receipt = environment[GLOBAL_NAME] || beginCanonicalChossidTiming(environment);
	const phase = detail.phase || detail.name || 'gltf-progress';
	const event = Object.freeze({
		atMilliseconds: detail.atMilliseconds ?? now(environment),
		bytes: finite(detail.bytes),
		fetchMilliseconds: finite(detail.fetchMilliseconds),
		parseMilliseconds: finite(detail.parseMilliseconds),
		phase,
		timings: detail.timings || detail.parser || null,
		totalMilliseconds: finite(detail.totalMilliseconds)
	});
	receipt.events.push(event);
	updateMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
		{
			importerStage: phase,
			resourceUrl: PLAYER_MODEL_URL
		}
	);
	return event;
}

/** Seals the timing receipt after canonical validation has passed or failed. */
export function completeCanonicalChossidTiming(environment, status) {
	const receipt = environment[GLOBAL_NAME] || beginCanonicalChossidTiming(environment);
	receipt.completedAtMilliseconds = now(environment);
	receipt.totalMilliseconds = round(receipt.completedAtMilliseconds - receipt.startedAtMilliseconds);
	receipt.status = status;
	return Object.freeze({
		...receipt,
		events: Object.freeze([...receipt.events])
	});
}

function finite(value) {
	return Number.isFinite(value) ? value : null;
}

function round(value) {
	return Math.round(value * 100) / 100;
}

function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
