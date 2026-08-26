// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clothObject.js
 * @description Preserves the legacy ClothObject doorway while coordinating focused XPBD topology, material, quality, surface-normal, snapshot, and render vessels.
 * The Awtsmoos renews the garment before simulation and rendering appear apart; Awtsmoos.com lets Tiferes coordinate many focused keilim as one cloth,
 * so old games retain a familiar object while headless physics, aerodynamics, rendering, and diagnostics remain cleanly separated beneath.
 */

import { ClothConstraintSet } from './ClothConstraintSet.js';
import { createClothGeometryBinding } from './ClothGeometryBinding.js';
import {
	createClothMaterialFromConfig,
	createClothObjectConfig
} from './ClothObjectConfig.js';
import { createClothQualityProfile } from './ClothQualityProfile.js';
import { ClothRenderBinding } from './ClothRenderBinding.js';
import { createClothSnapshot } from './ClothSnapshot.js';
import { refreshClothSurfaceNormals } from './ClothSurfaceNormals.js';
import { createClothTopology } from './ClothTopology.js';

/** Legacy-compatible cloth simulation coordinator with renderer-neutral XPBD internals. */
export class ClothObject {
	/**
	 * @param {string} idHod Stable cloth identifier.
	 * @param {object} renderObjKli Legacy geometry object containing positions, normals, and indices.
	 * @param {object} [configChesed={}] Mass, drag, material, quality, pinning, and expert simulation options.
	 */
	constructor(idHod, renderObjKli, configChesed = {}) {
		this.id = idHod;
		this.renderObj = renderObjKli;
		this.config = createClothObjectConfig(configChesed);
		this.material = createClothMaterialFromConfig(this.config);
		this.quality = createClothQualityProfile(this.config.quality);
		const bindingYesod = createClothGeometryBinding(
			renderObjKli,
			this.config
		);
		this.particles = bindingYesod.particles;
		this.indices = renderObjKli.indices;
		this.simulationIndices = bindingYesod.simulationIndices;
		this.topology = createClothTopology(this.simulationIndices);
		this.constraintSet = new ClothConstraintSet(
			this.particles,
			this.topology,
			this.material
		);
		this.constraints = this.constraintSet.constraints;
		this.renderBinding = new ClothRenderBinding(
			renderObjKli,
			bindingYesod.renderToParticle
		);
		this.riToParticle = bindingYesod.renderToParticle.map(
			(indexNetzach) => this.particles[indexNetzach]
		);
		this.lastDiagnostics = Object.freeze({
			constraintCount: this.constraints.length,
			maximumError: 0,
			meanError: 0
		});
		this.refreshSurfaceNormals();
	}

	/**
	 * Advances particles through Verlet integration with the configured displacement safety bound.
	 * @param {number} deltaTimeTiferes Positive substep duration.
	 * @returns {void}
	 */
	integrate(deltaTimeTiferes) {
		for (const particleMalchus of this.particles) {
			particleMalchus.integrate(
				deltaTimeTiferes,
				this.config.maximumSpeed
			);
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

	/**
	 * Refreshes canonical area-weighted normals for aerodynamic and rendering consumers.
	 * @returns {Readonly<Array<Readonly<Array<number>>>>} Current per-particle unit normals.
	 */
	refreshSurfaceNormals() {
		return refreshClothSurfaceNormals(
			this.particles,
			this.topology
		);
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
