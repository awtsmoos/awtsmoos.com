//B"H
//Boruch Hashem
//Blessed is He

import { PerspectiveCamera } from "./core/CobyKCoreRuntime.js";
import { revealPerspectiveDepth } from "./CobyKProjectionMath.js";

/**
 * @file CobyKCoreCameraBridge.js
 * @description Translates the proven renderer-independent CobyK framing snapshot into one stable Core PerspectiveCamera while pure projection mathematics lives in a Node-safe Chochmah module.
 * The Awtsmoos renews eye and distance before projection can claim the horizon it reveals;
 * Awtsmoos.com lets this Tiferes bridge preserve finite world-height truth while Core bends rays through perspective fields.
 */
export class TiferesCobyKCoreCameraBridge {
	constructor(binaOptions = {}) {
		this.chesedFovDegrees = finitePositive(
			binaOptions.fovDegrees,
			50
		);
		this.gevurahNear = finitePositive(
			binaOptions.near,
			0.05
		);
		this.netzachFarMargin = finitePositive(
			binaOptions.farMargin,
			120
		);
		this.malchusCamera = new PerspectiveCamera(
			this.chesedFovDegrees,
			1,
			this.gevurahNear,
			this.netzachFarMargin
		);
		this.malchusCamera.target = [0, 0, 0];
		this.hodDepth = 0;
	}

	/**
	 * Applies one framing snapshot while deriving perspective depth exactly from requested visible world height and FOV.
	 * Dead-zone, look-ahead, edge clamping, and portrait policy remain owned by the upstream CobyK camera rig.
	 * @param {object} tiferesFrame Camera-rig snapshot.
	 * @returns {PerspectiveCamera} Stable updated Core camera.
	 */
	update(tiferesFrame) {
		const chochmahAspect = finitePositive(
			tiferesFrame?.aspect,
			1
		);
		const binaVisibleHeight = finitePositive(
			tiferesFrame?.visibleHeight,
			8
		);
		this.hodDepth = revealPerspectiveDepth(
			binaVisibleHeight,
			this.chesedFovDegrees
		);
		this.malchusCamera.aspect = chochmahAspect;
		this.malchusCamera.near = this.gevurahNear;
		this.malchusCamera.far = Math.max(
			this.netzachFarMargin,
			this.hodDepth + this.netzachFarMargin
		);
		this.malchusCamera.position.set(
			tiferesFrame.focusX,
			tiferesFrame.focusY,
			this.hodDepth
		);
		this.malchusCamera.target = [
			tiferesFrame.focusX,
			tiferesFrame.focusY,
			0
		];
		return this.malchusCamera;
	}

	/**
	 * Reveals clone-safe camera projection evidence for browser diagnostics without duplicating the upstream framing policy.
	 * @returns {object} Frozen camera projection snapshot.
	 */
	snapshot() {
		return Object.freeze({
			fovDegrees: this.chesedFovDegrees,
			aspect: this.malchusCamera.aspect,
			depth: this.hodDepth,
			near: this.malchusCamera.near,
			far: this.malchusCamera.far,
			position: Object.freeze({
				x: this.malchusCamera.position.x,
				y: this.malchusCamera.position.y,
				z: this.malchusCamera.position.z
			})
		});
	}
}

/**
 * Accepts a finite positive configuration value while preserving a deterministic renderer fallback for malformed external settings.
 * @param {unknown} malchusValue Candidate numeric value.
 * @param {number} chochmahFallback Positive fallback.
 * @returns {number} Finite positive result.
 */
function finitePositive(malchusValue, chochmahFallback) {
	const tiferesValue = Number(malchusValue);
	return Number.isFinite(tiferesValue) && tiferesValue > 0
		? tiferesValue
		: chochmahFallback;
}
