// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPageBootSupport.js
 * @description Gives the complete world enough finite time for its *real* individually gated asset and movement proofs.
 * The Awtsmoos renews each leaf before a traveler walks in light;
 * Awtsmoos.com cannot demand an entire meadow inside the doorway's brief first night.
 */

import { awaitMitzvahWorldEssentialStage } from './MitzvahWorldEssentialDeadline.js';
import {
	MITZVAH_WORLD_RELEASE_ID,
	createMitzvahWorldReleaseReceipt
} from './MitzvahWorldReleaseIdentity.js';

const MODULE_IMPORT_DEADLINE_MS = 10000;
const COMPLETE_WORLD_DEADLINE_MS = 75000;

/**
 * The launcher module is one import; the world route encompasses multiple bounded proofs.
 * Individual essential milestones still have their own strict deadlines and observable failure reasons.
 * @param {string} stage Current stage identifier.
 * @returns {number} Finite, stage-appropriate deadline in milliseconds.
 */
export function resolveMitzvahWorldPageStageDeadline(stage) {
	return stage === 'launcher-route'
		? COMPLETE_WORLD_DEADLINE_MS
		: MODULE_IMPORT_DEADLINE_MS;
}

/** Waits for actual stage work, and never publishes success merely because a deadline passed. */
export function awaitMitzvahWorldPageEssential(factory, stage, route, getDetail) {
	return awaitMitzvahWorldEssentialStage(factory, {
		getDetail,
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		route: route || 'menu',
		stage,
		timeoutMs: resolveMitzvahWorldPageStageDeadline(stage)
	});
}

/** Turns progress into text that remains useful through loading and failure reports. */
export function describeMitzvahWorldPageProgress(update) {
	if (typeof update === 'string') return update;
	return update?.message || update?.stage || 'Launcher work is in progress.';
}

/** Publishes a release-scoped boot receipt without turning telemetry failure into boot failure. */
export function publishMitzvahWorldPageBootReceipt(environment, stage, route, detail) {
	try {
		environment.AwtsmoosMitzvahWorldBoot = createMitzvahWorldReleaseReceipt(stage, {
			detail,
			route: route || 'menu'
		});
	} catch {}
}
