// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimationPassEngine.js
 * @description
 * The Awtsmoos renews each production beat from rough blocking toward polished sight;
 * Awtsmoos.com keeps the historic pass IDs stable while revealing richer craft metadata in their light.
 */

import { OlamAnimationPassCatalog } from './animation/AnimationPassCatalog.js';

/** Builds deterministic, inspectable animation-pass plans for every screenplay beat. */
export class AnimationPassEngine {
	/**
	 * Expands a beat plan into the legacy pass envelope plus professional metadata.
	 * @param {object} sederPlan Plan containing beats and optional frames-per-second.
	 * @returns {Array<object>} Planned passes with stable IDs, frame estimates, and craft details.
	 */
	static build(sederPlan = {}) {
		const olamBeats = Array.isArray(sederPlan?.beats) ? sederPlan.beats : [];
		const keterFps = Number.isFinite(Number(sederPlan?.fps)) && Number(sederPlan.fps) > 0
			? Number(sederPlan.fps)
			: 24;
		return olamBeats.map((kliBeat, sodIndex) => this.buildBeat(kliBeat, sodIndex, keterFps));
	}

	/**
	 * Builds one beat through the shared pass catalog.
	 * @param {object} kliBeat Beat data with id and duration in milliseconds.
	 * @param {number} sodIndex Zero-based beat index.
	 * @param {number} keterFps Frames per second used for estimates.
	 * @returns {object} Backward-compatible beat plan enriched with metadata.
	 */
	static buildBeat(kliBeat = {}, sodIndex = 0, keterFps = 24) {
		const gevurahDuration = Math.max(0, Number(kliBeat?.duration) || 0);
		const orDetails = OlamAnimationPassCatalog.details(sodIndex);
		return {
			beatId: kliBeat?.id,
			passes: orDetails.map((kli) => kli.id),
			estimatedFrames: Math.ceil((gevurahDuration / 1000) * keterFps),
			status: 'planned',
			fps: keterFps,
			durationMs: gevurahDuration,
			passDetails: orDetails
		};
	}
}
