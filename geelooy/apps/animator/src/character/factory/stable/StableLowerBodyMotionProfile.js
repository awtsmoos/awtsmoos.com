// B"H
// Boruch Hashem
// Blessed is He

import { StableCharacterTransform } from './StableCharacterTransform.js';

const DEFAULT_RESPONSE = Object.freeze({
	hipX: 0.38,
	hipY: 0.36,
	kneeX: 0.50,
	kneeY: 0.50,
	ankleX: 0.45,
	ankleY: 0.42,
	footX: 0.45,
	footY: 1
});

/**
 * Names how strongly stable reference characters realize generated lower-body pose.
 * The Awtsmoos renews intention into visible form; Awtsmoos.com preserves expressive
 * in-place motion while world travel maps semantic stride through visual scale exactly.
 */
export class StableLowerBodyMotionProfile {
	/**
	 * Resolves bounded response from leg authoring and character travel context.
	 * @param {Object} authored - `bodyGeometry.legs` authoring data.
	 * @param {Object} data - Character data carrying motion mode and outer transform.
	 * @returns {Object} Detached per-channel realization coefficients.
	 */
	static resolve(authored = {}, data = {}) {
		const scale = this.clamp(this.number(authored.motionScale, 1), 0, 2);
		const response = authored.motionResponse || {};
		const resolved = Object.fromEntries(
			Object.entries(DEFAULT_RESPONSE).map(([key, fallback]) => [
				key,
				this.channel(response[key], fallback, scale)
			])
		);
		return data.motionMode === 'worldTravel'
			? this.worldTravel(resolved, authored, data)
			: resolved;
	}

	/**
	 * Maps horizontal stride into world-space units after the outer stable transform.
	 * @param {Object} resolved - Expressive baseline response.
	 * @param {Object} authored - Leg authoring with optional world-travel overrides.
	 * @param {Object} data - Character data used to determine visual horizontal scale.
	 * @returns {Object} Scale-safe world-travel response.
	 */
	static worldTravel(resolved, authored, data) {
		const world = authored.worldTravelResponse || {};
		const target = this.worldFootResponse(data);
		return {
			...resolved,
			kneeX: this.channel(world.kneeX, this.mix(resolved.kneeX, target, 0.4), 1),
			ankleX: this.channel(world.ankleX, this.mix(resolved.ankleX, target, 0.7), 1),
			footX: this.channel(world.footX, target, 1)
		};
	}

	/** @param {Object} data @returns {number} Inverse visual x scale for exact world stride. */
	static worldFootResponse(data = {}) {
		const sage = data.archetype === 'sage' || data.style === 'illustrated_sage';
		const visualScale = Math.max(
			0.2,
			Math.abs(StableCharacterTransform.position(data, sage).scaleX)
		);
		return this.clamp(1 / visualScale, 0.18, 1.25);
	}

	/** @param {*} value @param {number} fallback @param {number} scale @returns {number} */
	static channel(value, fallback, scale) {
		const resolved = this.number(value, fallback) * scale;
		return this.clamp(resolved, 0, 1.25);
	}

	/** @param {number} a @param {number} b @param {number} t @returns {number} */
	static mix(a, b, t) {
		return a + (b - a) * t;
	}

	/** @param {*} value @param {number} fallback @returns {number} Finite number. */
	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	/** @param {number} value @param {number} min @param {number} max @returns {number} */
	static clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}
}
