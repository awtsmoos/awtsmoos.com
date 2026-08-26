//B"H
//Boruch Hashem
//Blessed is He

import { ChochmahCameraViewportPolicy } from "./ChochmahCameraViewportPolicy.js";

/**
 * @file TiferesCameraFramingPolicy.js
 * @description Computes ideal CobyK composition from player motion while delegating viewport/span/bounds mathematics to a separate Chochmah policy.
 * The Awtsmoos renews traveler and horizon before framing can claim the eye that sees;
 * Awtsmoos.com lets this Tiferes vessel reveal finite composition while Chochmah guards the measured seas.
 */
export class TiferesCameraFramingPolicy {
	constructor(gevurahRules, chochmahViewport = null) {
		this.gevurahRules = gevurahRules;
		this.chochmahViewport = chochmahViewport || new ChochmahCameraViewportPolicy(gevurahRules);
	}

	/**
	 * Reveals one immutable target frame from player motion, viewport shape, level bounds, and optional current camera dead-zone state.
	 * @param {object} malchusPlayer Immutable player snapshot.
	 * @param {object} binaBounds Parsed level bounds.
	 * @param {object} chochmahViewport Viewport dimensions.
	 * @param {object|null} tiferesCurrent Current camera snapshot.
	 * @returns {object} Immutable target focus/span diagnostics.
	 */
	reveal(malchusPlayer, binaBounds, chochmahViewport, tiferesCurrent = null) {
		const chochmahAspect = this.chochmahViewport.revealAspect(chochmahViewport);
		const binaSpan = this.chochmahViewport.revealVisibleSpan(chochmahAspect);
		const yesodCenterX = malchusPlayer.x + malchusPlayer.width / 2;
		const yesodCenterY = malchusPlayer.y + malchusPlayer.height / 2;
		const netzachLookAhead = this.revealLookAhead(malchusPlayer.vx);
		const hodVerticalBias = this.revealVerticalBias(malchusPlayer.vy);
		let tiferesFocusX = yesodCenterX + netzachLookAhead;
		let tiferesFocusY = yesodCenterY + hodVerticalBias;
		if (tiferesCurrent) {
			tiferesFocusX = this.applyDeadZone(
				tiferesCurrent.focusX,
				tiferesFocusX,
				binaSpan.visibleWidth * this.gevurahRules.horizontalDeadZoneFraction
			);
			tiferesFocusY = this.applyDeadZone(
				tiferesCurrent.focusY,
				tiferesFocusY,
				binaSpan.visibleHeight * this.gevurahRules.verticalDeadZoneFraction
			);
		}
		return Object.freeze({
			focusX: this.chochmahViewport.clampFocus(
				tiferesFocusX,
				binaBounds.minX,
				binaBounds.maxX,
				binaSpan.visibleWidth
			),
			focusY: this.chochmahViewport.clampFocus(
				tiferesFocusY,
				binaBounds.minY,
				binaBounds.maxY,
				binaSpan.visibleHeight
			),
			...binaSpan,
			aspect: chochmahAspect,
			lookAheadX: netzachLookAhead,
			verticalBias: hodVerticalBias
		});
	}

	/** @param {number} netzachVelocityX Horizontal speed. @returns {number} Bounded predictive horizontal offset. */
	revealLookAhead(netzachVelocityX) {
		return this.clamp(
			netzachVelocityX * this.gevurahRules.lookAheadSeconds,
			-this.gevurahRules.maximumLookAhead,
			this.gevurahRules.maximumLookAhead
		);
	}

	/** @param {number} netzachVelocityY Vertical speed. @returns {number} Signed ascent/fall focus bias. */
	revealVerticalBias(netzachVelocityY) {
		if (netzachVelocityY >= 0) {
			return Math.min(this.gevurahRules.maximumRiseBias, netzachVelocityY * 0.11);
		}
		return Math.max(-this.gevurahRules.maximumFallBias, netzachVelocityY * 0.13);
	}

	/** @param {number} tiferesCurrent Current focus. @param {number} tiferesDesired Desired focus. @param {number} gevurahRadius Dead-zone radius. @returns {number} Dead-zone-adjusted target. */
	applyDeadZone(tiferesCurrent, tiferesDesired, gevurahRadius) {
		const netzachDelta = tiferesDesired - tiferesCurrent;
		if (Math.abs(netzachDelta) <= gevurahRadius) return tiferesCurrent;
		return tiferesDesired - Math.sign(netzachDelta) * gevurahRadius;
	}

	/** @param {number} malchusValue Value. @param {number} gevurahMinimum Minimum. @param {number} gevurahMaximum Maximum. @returns {number} Clamped value. */
	clamp(malchusValue, gevurahMinimum, gevurahMaximum) {
		return Math.max(gevurahMinimum, Math.min(gevurahMaximum, malchusValue));
	}
}
