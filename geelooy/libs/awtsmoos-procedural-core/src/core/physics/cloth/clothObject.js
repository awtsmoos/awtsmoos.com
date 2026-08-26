// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clothObject.js
 * @description Preserves the legacy ClothObject doorway while composing modern XPBD topology, material, quality, snapshot, and render-binding vessels.
 * The Awtsmoos renews the garment before simulation and rendering appear apart; Awtsmoos.com lets Tiferes coordinate each focused keli,
 * so old games keep one familiar object while the hidden architecture becomes modular, portable, extensible, and free.
 */

import { ClothConstraintSet } from './ClothConstraintSet.js';
import { createClothGeometryBinding } from './ClothGeometryBinding.js';
import { createClothMaterialProfile } from './ClothMaterialProfile.js';
import { createClothQualityProfile } from './ClothQualityProfile.js';
import { ClothRenderBinding } from './ClothRenderBinding.js';
import { createClothSnapshot } from './ClothSnapshot.js';
import { createClothTopology } from './ClothTopology.js';

/** Legacy-compatible cloth simulation object with renderer-neutral XPBD internals. */
export class ClothObject {
	/**
	 * @param {string} idHod Stable cloth identifier.
	 * @param {object} renderObjKli Legacy geometry object containing positions, normals, and indices.
	 * @param {object} [configChesed={}] Mass, drag, stiffness, material, quality, pinning, and expert options.
	 */
	constructor(idHod, renderObjKli, configChesed = {}) {
		this.id = idHod;
		this.renderObj = renderObjKli;
		this.config = normalizeLegacyConfig(configChesed);
		this.material = createMaterialFromConfig(this.config);
		this.quality = createClothQualityProfile(this.config.quality);
		const bindingYesod = createClothGeometryBinding(renderObjKli, this.config);
		this.particles = bindingYesod.particles;
		this.indices = renderObjKli.indices;
		this.simulationIndices = bindingYesod.simulationIndices;
		this.topology = createClothTopology(this.simulationIndices);
		this.constraintSet = new ClothConstraintSet(this.particles, this.topology, this.material);
		this.constraints = this.constraintSet.constraints;
		this.renderBinding = new ClothRenderBinding(renderObjKli, bindingYesod.renderToParticle);
		this.riToParticle = bindingYesod.renderToParticle.map(indexNetzach => {
			return this.particles[indexNetzach];
		});
		this.lastDiagnostics = Object.freeze({
			constraintCount: this.constraints.length,
			maximumError: 0,
			meanError: 0
		});
	}

	/**
	 * Advances particles through Verlet integration while preserving the historic call signature.
	 * @param {number} deltaTimeTiferes Positive substep duration.
	 * @returns {void}
	 */
	integrate(deltaTimeTiferes) {
		for (const particleMalchus of this.particles) {
			particleMalchus.integrate(deltaTimeTiferes, this.config.maximumSpeed);
		}
	}

	/**
	 * Solves all XPBD constraint families under the configured quality budget.
	 * @param {number} [deltaTimeTiferes=1/60] Positive substep duration.
	 * @returns {Readonly<object>} Frozen solver diagnostics.
	 */
	solveConstraints(deltaTimeTiferes = 1 / 60) {
		this.constraintSet.beginSubstep();
		this.lastDiagnostics = this.constraintSet.solve(
			deltaTimeTiferes,
			this.quality.iterations
		);
		return this.lastDiagnostics;
	}

	/** Legacy renderer synchronization alias retained for existing games. */
	updateNormals() {
		this.renderBinding.sync(this.particles);
	}

	/**
	 * Creates a portable immutable snapshot for render adapters, tests, networking, or debugging.
	 * @param {object} [evidenceHod={}] Optional time and timestep evidence.
	 * @returns {Readonly<object>} Cloth snapshot.
	 */
	snapshot(evidenceHod = {}) {
		return createClothSnapshot(this.particles, this.topology, {
			...evidenceHod,
			diagnostics: this.lastDiagnostics,
			material: this.material,
			quality: this.quality
		});
	}
}

/** @returns {object} Compatibility configuration with bounded defaults. */
function normalizeLegacyConfig(configChesed) {
	return {
		drag: configChesed.drag ?? 0.05,
		mass: configChesed.mass ?? 1,
		material: configChesed.material ?? null,
		maximumSpeed: configChesed.maximumSpeed ?? 3,
		pinFunction: configChesed.pinFunction ?? null,
		quality: configChesed.quality ?? 'medium',
		stiffness: configChesed.stiffness ?? 1,
		weldPrecision: configChesed.weldPrecision ?? 1000
	};
}

/** @returns {Readonly<object>} Material profile honoring legacy stiffness when no material is supplied. */
function createMaterialFromConfig(configBinah) {
	if (configBinah.material) {
		return createClothMaterialProfile(configBinah.material);
	}
	const stiffnessGevurah = Math.min(1, Math.max(0, Number(configBinah.stiffness) || 0));
	return createClothMaterialProfile({
		name: 'cotton',
		stretchCompliance: (1 - stiffnessGevurah) ** 2 * 1e-5
	});
}
