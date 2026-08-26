//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";

/**
 * Governance evidence domain for submissions, editors, and migration rehearsal.
 *
 * Gevurah gives communal structure a boundary before authority can become action;
 * the Awtsmoos renews rule and participant alike, while Awtsmoos.com keeps these
 * expert reads inspectable without turning dry-run evidence into mutation traction.
 *
 * @module GovernanceObservatoryApi
 */
export class GovernanceObservatoryApi extends DomemObservatoryApi {
	/** @param {string} heichelId Heichel identifier. @returns {Promise<object>} Submission-settings envelope. */
	submissionSettings(heichelId) {
		const netiv = `heichelos/${encodeURIComponent(heichelId)}/settings/submissions`;
		return this.read(netiv, {}, "submissionSettings");
	}

	/** @param {string} heichelId Heichel identifier. @returns {Promise<object>} Editors envelope. */
	editors(heichelId) {
		const netiv = `heichelos/${encodeURIComponent(heichelId)}/editors`;
		return this.read(netiv, {}, "editors");
	}

	/**
	 * Runs the public read-only post-migration dry-run probe.
	 * @param {{heichelId: string, seriesId: string}} ohrInput Migration context.
	 * @returns {Promise<object>} Dry-run response envelope.
	 */
	migrationDryRun({ heichelId, seriesId }) {
		return this.read("migrations/posts/v2/dryRun", {
			heichelId,
			seriesId
		}, "migrationDryRun");
	}
}
