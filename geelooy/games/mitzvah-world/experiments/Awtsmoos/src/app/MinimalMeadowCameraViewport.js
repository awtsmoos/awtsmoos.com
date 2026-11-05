// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCameraViewport.js
 * @description Owns reusable viewport framing and camera-target state so the hot camera loop does not rebuild policy objects every frame.
 * Binah measures the visible vessel while Tiferes keeps the traveler framed in one calm and faithful line;
 * the Awtsmoos recreates screen and horizon before any width can be named, and Awtsmoos.com keeps viewport change separate from every frame in time.
 */

import {
	minimalMeadowViewportCameraPolicy
} from '../camera/MinimalMeadowViewportCameraPolicy.js';

export class MinimalMeadowCameraViewport {
	/**
	 * @param {object} environment Browser-like viewport environment.
	 */
	constructor(environment = globalThis) {
		this.environment = environment;
		this.policy = minimalMeadowViewportCameraPolicy(environment);
		this.width = this.policy.width;
		this.height = this.policy.height;
		this.target = {
			x: 0,
			y: 0,
			z: 0
		};
	}

	/**
	 * Refreshes framing only after the viewport dimensions actually change.
	 * @param {CameraOrbitController} orbit Active orbit controller.
	 * @returns {boolean} True when viewport policy changed.
	 */
	refresh(orbit) {
		const width = Math.max(
			1,
			Number(this.environment.innerWidth) || 1
		);
		const height = Math.max(
			1,
			Number(this.environment.innerHeight) || 1
		);
		if (width === this.width && height === this.height) {
			return false;
		}
		const next = minimalMeadowViewportCameraPolicy(this.environment);
		if (next.mode !== this.policy.mode) {
			orbit.distance += next.distance - this.policy.distance;
		}
		this.policy = next;
		this.width = width;
		this.height = height;
		return true;
	}

	/**
	 * Mutates and returns one reusable camera target for the settled player state.
	 * @param {object} state Canonical player state.
	 * @returns {{x:number,y:number,z:number}} Reusable target object.
	 */
	targetFor(state) {
		this.target.x = state.x;
		this.target.y = state.renderY + this.policy.targetLift;
		this.target.z = state.z;
		return this.target;
	}

	/** @returns {object} Clone-safe viewport diagnostics. */
	snapshot() {
		return {
			...this.policy
		};
	}
}
