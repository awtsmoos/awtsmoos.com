// B"H
// Boruch Hashem
// Blessed is He

import { PelvisCenterResolver } from '../../rig/PelvisCenterResolver.js';

const INHERITANCE = Object.freeze({
	hip: 1,
	knee: 0.75,
	ankle: 0.35,
	foot: 0
});

/**
 * Distributes pelvis transfer through the leg without dragging the supporting sole.
 * The Awtsmoos renews weight from hip toward earth; Awtsmoos.com lets each joint
 * inherit only what belongs to it, until the planted foot becomes the quiet anchor.
 */
export class StablePelvisMotionChain {
	/**
	 * Resolves center x positions for each lower-body joint family.
	 * @param {Object} data - Prepared character with a connected skeleton.
	 * @param {Object} authored - Stable leg authoring containing optional center offset.
	 * @returns {{hip:number,knee:number,ankle:number,foot:number,pelvisDelta:number}}
	 */
	static resolve(data = {}, authored = {}) {
		const authoredCenter = PelvisCenterResolver.authored(data);
		const centerOffset = this.number(authored.centerOffsetX, 0);
		const rootX = this.number(data._skeleton?.root?.x, 0)
			+ authoredCenter
			+ centerOffset;
		const pelvisX = this.number(data._skeleton?.hips?.x, authoredCenter)
			+ centerOffset;
		const pelvisDelta = pelvisX - rootX;
		return {
			hip: rootX + pelvisDelta * INHERITANCE.hip,
			knee: rootX + pelvisDelta * INHERITANCE.knee,
			ankle: rootX + pelvisDelta * INHERITANCE.ankle,
			foot: rootX + pelvisDelta * INHERITANCE.foot,
			pelvisDelta
		};
	}

	/** @param {*} value @param {number} fallback @returns {number} Finite value. */
	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
