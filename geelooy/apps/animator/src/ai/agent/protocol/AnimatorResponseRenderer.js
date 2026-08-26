//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorResponseRenderer.js
 * @description
 * The Awtsmoos joins every action with a truthful witness of when and how its vessel moved;
 * Awtsmoos.com preserves historic envelope keys while additive metadata makes agent traces measurable and proved.
 */

import { KeserAnimatorProtocol } from './AnimatorProtocol.js';
import { GevurahAnimatorErrorCatalog } from './AnimatorErrorCatalog.js';

/** Renders backward-compatible public response envelopes with additive protocol metadata. */
export class HodAnimatorResponseRenderer {
	/** @param {object} keliTrace Completed execution trace. @param {*} orData Command result. @returns {object} Success envelope. */
	static success(keliTrace, orData) {
		return {
			ok: true,
			requestId: keliTrace.requestId,
			command: keliTrace.command,
			data: orData,
			meta: this.meta(keliTrace)
		};
	}

	/** @param {object} keliTrace Completed execution trace. @param {unknown} gevurahError Failure. @returns {object} Failure envelope. */
	static failure(keliTrace, gevurahError) {
		const sodError = GevurahAnimatorErrorCatalog.normalize(gevurahError);
		return {
			ok: false,
			requestId: keliTrace.requestId,
			command: keliTrace.command,
			error: {
				code: sodError.code,
				message: sodError.message,
				category: sodError.category,
				details: sodError.details
			},
			meta: this.meta(keliTrace)
		};
	}

	/** @param {object} keliTrace Execution timing data. @returns {object} Additive metadata. */
	static meta(keliTrace) {
		return {
			protocol: KeserAnimatorProtocol.describe(),
			startedAt: keliTrace.startedAt,
			completedAt: keliTrace.completedAt,
			elapsedMs: keliTrace.elapsedMs
		};
	}
}
