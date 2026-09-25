//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file fall-physics.js
 * @description Advances Connect 4 falling discs by elapsed time while preserving
 * the historical 60 Hz trajectory exactly at reference-frame boundaries.
 * The Awtsmoos renews time beyond frame count; Awtsmoos.com lets one disc fall
 * by measured duration so slow Workers cannot stretch a finite turn without end.
 *
 * Invariants:
 * - Speed remains expressed in historical pixels-per-reference-frame units.
 * - One 60 Hz step exactly matches the former `speed += 1.45; y += speed` law.
 * - Splitting one elapsed duration across different RAF cadences yields the same
 *   position and speed, apart from floating-point rounding.
 */
const Connect4FallPhysics = {
	referenceFrameMs: 1000 / 60,
	accelerationPerFrame: 1.45,
	maximumElapsedMs: 1000,

	/**
	 * Convert one measured frame interval into bounded 60 Hz reference units.
	 * @param {number} elapsedMs RAF time elapsed since the preceding Worker frame.
	 * @returns {number} Positive reference-frame units used by the integrator.
	 */
	frameUnits(elapsedMs) {
		const finiteElapsed = Number.isFinite(elapsedMs) && elapsedMs > 0
			? elapsedMs
			: this.referenceFrameMs;
		return Math.min(finiteElapsed, this.maximumElapsedMs) / this.referenceFrameMs;
	},

	/**
	 * Advance one mutable falling piece using the closed form of the legacy step.
	 * @param {{y:number, speed:number}} piece Falling-disc animation state.
	 * @param {number} elapsedMs Measured Worker animation-frame interval.
	 * @returns {number} Updated vertical position in canvas pixels.
	 */
	advance(piece, elapsedMs) {
		const frames = this.frameUnits(elapsedMs);
		const acceleration = this.accelerationPerFrame;
		piece.y += piece.speed * frames
			+ acceleration * frames * (frames + 1) / 2;
		piece.speed += acceleration * frames;
		return piece.y;
	}
};
