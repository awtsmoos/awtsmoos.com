// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particle.js
 * @description Preserves the legacy cloth particle contract while exposing explicit velocity, reset, and portable state for modern XPBD coordination.
 * The Awtsmoos renews position before motion remembers yesterday; Awtsmoos.com lets Netzach carry momentum through a finite vessel,
 * so legacy Verlet cloth remains compatible while newer solvers can inspect velocity and state without renderer dependence or wrestle.
 */

import { Vec3 } from '../../math/vec3.js';

/** Canonical cloth particle retaining the historic `pos`/`oldPos` Verlet representation. */
export class Particle {
	/**
	 * @param {number} xOhr Initial X coordinate.
	 * @param {number} yOhr Initial Y coordinate.
	 * @param {number} zOhr Initial Z coordinate.
	 * @param {number} [massKli=1] Positive particle mass.
	 * @param {number} [dragGevurah=0.01] Velocity damping scalar in [0,1].
	 * @param {boolean} [pinnedYesod=false] Whether this particle has zero inverse mass.
	 */
	constructor(xOhr, yOhr, zOhr, massKli = 1, dragGevurah = 0.01, pinnedYesod = false) {
		this.pos = [xOhr, yOhr, zOhr];
		this.oldPos = [...this.pos];
		this.originalPos = [...this.pos];
		this.forces = [0, 0, 0];
		this.mass = positive(massKli, 1);
		this.pinned = Boolean(pinnedYesod);
		this.invMass = this.pinned ? 0 : 1 / this.mass;
		this.drag = clamp(Number(dragGevurah) || 0, 0, 1);
		this.renderIndices = [];
		this.accumulatedNormal = [0, 1, 0];
	}

	/**
	 * Advances Verlet state using accumulated force and bounded displacement.
	 * @param {number} deltaTimeTiferes Positive simulation timestep.
	 * @param {number} [maximumSpeedGevurah=3] Optional displacement-speed safety limit.
	 * @returns {void}
	 */
	integrate(deltaTimeTiferes, maximumSpeedGevurah = 3) {
		if (this.pinned) {
			this.forces = [0, 0, 0];
			return;
		}
		const safeTimeGevurah = Math.max(1e-6, Number(deltaTimeTiferes) || 0);
		const velocityOhr = Vec3.scale(Vec3.sub(this.pos, this.oldPos), 1 - this.drag);
		const accelerationOhr = Vec3.scale(this.forces, this.invMass * safeTimeGevurah * safeTimeGevurah);
		const displacementOhr = limitVector(Vec3.add(velocityOhr, accelerationOhr), maximumSpeedGevurah * safeTimeGevurah);
		this.oldPos = [...this.pos];
		this.pos = Vec3.add(this.pos, displacementOhr);
		this.forces = [0, 0, 0];
	}

	/** Adds one world-space force vector to this particle's current substep accumulator. */
	addForce(forceOhr) {
		this.forces = Vec3.add(this.forces, forceOhr);
	}

	/** @returns {Array<number>} Current velocity reconstructed from Verlet positions. */
	velocity(deltaTimeTiferes = 1 / 60) {
		const safeTimeGevurah = Math.max(1e-6, Number(deltaTimeTiferes) || 0);
		return Vec3.scale(Vec3.sub(this.pos, this.oldPos), 1 / safeTimeGevurah);
	}

	/** Sets velocity without changing the current position, preserving Verlet compatibility. */
	setVelocity(velocityOhr, deltaTimeTiferes = 1 / 60) {
		const safeTimeGevurah = Math.max(1e-6, Number(deltaTimeTiferes) || 0);
		this.oldPos = Vec3.sub(this.pos, Vec3.scale(velocityOhr, safeTimeGevurah));
	}

	/** Restores the original position and clears forces while preserving pin/mass configuration. */
	reset() {
		this.pos = [...this.originalPos];
		this.oldPos = [...this.originalPos];
		this.forces = [0, 0, 0];
	}
}

/** @returns {Array<number>} Vector limited to a maximum Euclidean magnitude. */
function limitVector(vectorOhr, maximumGevurah) {
	const lengthTiferes = Vec3.len(vectorOhr);
	return lengthTiferes > maximumGevurah && lengthTiferes > 1e-12
		? Vec3.scale(vectorOhr, maximumGevurah / lengthTiferes)
		: vectorOhr;
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Scalar clamped to inclusive bounds. */
function clamp(valueOhr, minimumGevurah, maximumChesed) {
	return Math.min(maximumChesed, Math.max(minimumGevurah, valueOhr));
}
