// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationSystem.js
 * @description Orchestrates dense ecological cells through bounded visibility, coherent gusts, smooth traveler wake, and mount diagnostics.
 * The Awtsmoos lets nearby blade and blossom answer the traveler while distant abundance rests;
 * Awtsmoos.com preserves real grass batches, rooted geometry, staggered work, and living continuity through every meadow test.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowVegetationCells } from './MinimalMeadowVegetationCells.js';
import { createMinimalMeadowVegetationCell } from './MinimalMeadowVegetationDistributionCellFactory.js';
import {
	prepareMinimalMeadowVegetationDynamics,
	updateMinimalMeadowVegetationDynamics
} from './MinimalMeadowVegetationDynamics.js';
import {
	countMinimalMeadowVegetationActivity,
	createMinimalMeadowVegetationMotionState,
	minimalMeadowVegetationUsesMobileProfile,
	updateMinimalMeadowVegetationMotionState
} from './MinimalMeadowVegetationMotionState.js';
import { minimalMeadowVegetationDiagnostics } from './MinimalMeadowWorldPopulationDiagnostics.js';
import { minimalMeadowVegetationBudget } from './MinimalMeadowVegetationQualityBudget.js';

/** Owns mounted ecological cells while focused helpers own distribution, motion, and diagnostics. */
export class MinimalMeadowVegetationSystem {
	/** Creates deterministic cell geometry and prepares reusable motion state. */
	constructor(runtime) {
		if (runtime.vegetation?.group) {
			return runtime.vegetation;
		}
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_seeded_ecological_vegetation';
		this.clock = 0;
		this.mobile = minimalMeadowVegetationUsesMobileProfile(runtime);
		this.budget = minimalMeadowVegetationBudget({
			mobile: this.mobile,
			quality: runtime.qualityProfile?.quality
		});
		this.specifications = createMinimalMeadowVegetationCells(runtime.terrain, {
			budget: this.budget,
			mobile: this.mobile,
			quality: this.budget.quality
		});
		this.cells = this.specifications.map(specification => (
			prepareMinimalMeadowVegetationDynamics(
				createMinimalMeadowVegetationCell(specification, runtime.terrain)
			)
		));
		this.motion = createMinimalMeadowVegetationMotionState(runtime.state);
		for (const cell of this.cells) {
			this.group.add(cell.group);
		}
	}

	/** Advances visibility and staggered ecological motion using one allocation-light wind context. */
	update(deltaSeconds) {
		const delta = Math.max(0, Number(deltaSeconds || 0));
		this.clock += delta;
		const player = this.runtime.state;
		const windContext = updateMinimalMeadowVegetationMotionState(
			this.motion,
			player,
			delta,
			this.clock
		);
		const stride = Math.max(1, Math.round(1 / this.budget.updateFraction));
		const phase = Math.floor(this.clock * 60) % stride;
		for (let index = 0; index < this.cells.length; index += 1) {
			const cell = this.cells[index];
			this.updateVisibility(cell, player);
			if (index % stride === phase || cell.reaction > 0.002) {
				updateMinimalMeadowVegetationDynamics(cell, windContext);
			}
		}
	}

	/** Updates one cell's squared distance and bounded visibility without allocation. */
	updateVisibility(cell, player) {
		const dx = cell.x - player.x;
		const dz = cell.z - player.z;
		cell.distanceSquared = dx * dx + dz * dz;
		const maximum = cell.budget?.visibilityDistance || this.budget.visibilityDistance;
		cell.group.visible = cell.distanceSquared <= maximum * maximum;
	}

	/** Returns runtime evidence for rendering, reactivity, moisture, budget, and scene mounting. */
	diagnostics() {
		const activity = countMinimalMeadowVegetationActivity(this.cells);
		return {
			...minimalMeadowVegetationDiagnostics(this),
			budget: this.budget,
			mounted: this.group.parent === this.runtime.scene,
			reactiveCells: activity.reactive,
			visibleCells: activity.visible,
			wetCells: activity.wet
		};
	}

	/** Detaches the ecology group and releases runtime ownership. */
	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.vegetation === this) {
			this.runtime.vegetation = null;
		}
	}
}
