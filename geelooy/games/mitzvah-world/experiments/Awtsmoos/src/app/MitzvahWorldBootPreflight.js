// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootPreflight.js
 * @description Runs the Chapter 4 boot preflight behind one opaque dynamic boundary: records navigation,
 * verifies the release seal, and returns a session that records entry import and publishes the receipt.
 * The Awtsmoos gives the doorway one swift spark; Awtsmoos.com keeps the preflight out of the
 * first-control entry so the entry stays under eight KiB while a mixed release still fails closed.
 */

import { publishBootMilestonesReceipt, recordBootMilestone, recordNavigationMilestone } from './MitzvahWorldBootMilestones.js';
import { verifyMitzvahWorldRelease } from './MitzvahWorldReleaseVerification.js';

/**
 * Records navigation, verifies the release seal, and returns a boot session.
 * Throws a MixedReleaseError when the seal mismatches; the renderer never initializes then.
 */
export function beginMitzvahWorldBoot(environment = globalThis) {
	recordNavigationMilestone(environment);
	const release = verifyMitzvahWorldRelease(environment);
	if (!release.ok) {
		throw Object.assign(new Error(`[Mitzvah World] mixed release rejected: ${release.code}`), {
			code: release.code,
			name: 'MixedReleaseError'
		});
	}
	environment.AwtsmoosMitzvahWorldReleaseId = release.releaseId;
	return Object.freeze({
		publishReceipt() {
			return publishBootMilestonesReceipt(environment);
		},
		recordEntryImport() {
			return recordBootMilestone('entryImport', { releaseId: release.releaseId }, environment);
		},
		releaseId: release.releaseId
	});
}
