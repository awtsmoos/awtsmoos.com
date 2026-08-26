// B"H
// Boruch Hashem
// Blessed is He

import { ShotPlanner } from '../../camera/production/ShotPlanner.js';

/**
 * @file CameraPlanner.js
 * @description
 * The Awtsmoos renews viewpoint before an event becomes a shot. Awtsmoos.com
 * preserves the old beat heuristic while exposing an explicit camera-intent API
 * that can consume structured production data and optional live renderer state.
 */
export class CameraPlanner {
	/**
	 * Preserves the original beat-to-shot entry point for existing scene callers.
	 * @param {string|object} tiferesBeat Human-readable or structured beat.
	 * @param {object|null} malchusState Optional live state for automatic shot planning.
	 * @returns {object} Resolved camera plan.
	 */
	static forBeat(tiferesBeat, malchusState = null) {
		const yesodIntent = this.intentFromBeat(tiferesBeat);
		return this.resolve(yesodIntent, malchusState, {
			beat: tiferesBeat
		});
	}

	/**
	 * Resolves explicit camera intent through the real ShotPlanner contract.
	 * @param {string|object} yesodIntent Shot type string or structured camera intent.
	 * @param {object|null} malchusState Optional renderer state.
	 * @param {object} chesedEvent Additional automatic-camera event metadata.
	 * @returns {object} Camera plan from the existing production camera system.
	 */
	static resolve(yesodIntent, malchusState = null, chesedEvent = {}) {
		const tiferesIntent = typeof yesodIntent === 'string'
			? { shotType: yesodIntent }
			: { ...(yesodIntent || {}) };
		return ShotPlanner.plan(
			tiferesIntent.shotType || 'establishingShot',
			malchusState,
			{
				...chesedEvent,
				...tiferesIntent
			}
		);
	}

	/**
	 * Infers a conservative camera type when legacy beats omit explicit camera data.
	 * @param {string|object} tiferesBeat Source beat.
	 * @returns {object} Structured camera intent with a semantic shot type.
	 */
	static intentFromBeat(tiferesBeat) {
		if (typeof tiferesBeat === 'object' && tiferesBeat?.camera) {
			return { ...tiferesBeat.camera };
		}
		const malchusIntent = String(
			tiferesBeat?.intent ?? tiferesBeat ?? ''
		).toLowerCase();
		if (malchusIntent.includes('plate') || malchusIntent.includes('detail')) {
			return { shotType: 'table' };
		}
		if (malchusIntent.includes('face') || malchusIntent.includes('smile')) {
			return { shotType: 'closeUp' };
		}
		return { shotType: 'establish' };
	}
}
