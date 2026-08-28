// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Resolves the connected-body transform without letting world travel drag planted feet.
 * The Awtsmoos renews sway and grounding together; Awtsmoos.com keeps in-place acting
 * expressive while world-travel balance is carried by the articulated skeleton instead.
 */
export class StableBodyAxisMotion {
	/**
	 * Converts body pose into the group transform surrounding connected character layers.
	 * @param {Object} data - Prepared character data.
	 * @param {Object} body - Generated whole-body pose channels.
	 * @returns {{x:number,y:number,scaleY:number,rotation:number}} Group transform.
	 */
	static resolve(data = {}, body = {}) {
		const authoring = data.bodyGeometry?.motion || {};
		const inPlaceX = this.response(authoring.axisX, 0.08, 0.3);
		const worldTravelX = this.response(authoring.worldTravelAxisX, 0, 0.12);
		const response = data.motionMode === 'worldTravel'
			? worldTravelX
			: inPlaceX;
		return {
			x: S.num(body.hipX, 0) * response,
			y: S.clamp(S.num(body.bob, 0), -13, 8),
			scaleY: S.clamp(S.num(body.torsoBreathScale, 1), 0.96, 1.05),
			rotation: S.num(body.torsoLean, 0) * 0.006
		};
	}

	/** @param {*} value @param {number} fallback @param {number} max @returns {number} */
	static response(value, fallback, max) {
		return S.clamp(S.num(value, fallback), 0, max);
	}
}
