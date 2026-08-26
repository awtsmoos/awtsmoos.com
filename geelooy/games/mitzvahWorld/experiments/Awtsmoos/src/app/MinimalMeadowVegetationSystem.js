//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowVegetationSystem.js
<<<<<<< HEAD
 * @description Orchestrates dense ecological cells through bounded visibility, coherent gusts, and smooth traveler wake.
 * The Awtsmoos lets nearby blade and blossom answer the traveler while distant abundance rests;
 * Awtsmoos.com preserves real grass batches, rooted geometry, and staggered work while the meadow gains living continuity.
=======
 * @description Keeps dense ecological cells visible, mounted, and reactive through distance-aware staggered updates.
 * The Awtsmoos lets nearby blade and blossom answer the traveler while distant abundance rests;
 * Awtsmoos.com preserves every cell, full high quality, bounded arithmetic, zero-allocation wind, and live mount evidence.
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowVegetationCells } from './MinimalMeadowVegetationCells.js';
import { createMinimalMeadowVegetationCell } from './MinimalMeadowVegetationDistributionCellFactory.js';
<<<<<<< HEAD
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
=======
import { minimalMeadowVegetationDiagnostics } from './MinimalMeadowWorldPopulationDiagnostics.js';
import { minimalMeadowVegetationBudget } from './MinimalMeadowVegetationQualityBudget.js';

const INTERACTION_RADIUS = 7.5;
const INTERACTION_RADIUS_SQUARED = INTERACTION_RADIUS * INTERACTION_RADIUS;
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8

export class MinimalMeadowVegetationSystem {
	constructor(runtime) {
		if (runtime.vegetation?.group) return runtime.vegetation;
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
		this.cells = this.specifications.map(specification => prepareMinimalMeadowVegetationDynamics(
			createMinimalMeadowVegetationCell(specification, runtime.terrain)
		));
		this.motion = createMinimalMeadowVegetationMotionState(runtime.state);
		for (const cell of this.cells) this.group.add(cell.group);
	}

	update(deltaSeconds) {
<<<<<<< HEAD
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
=======
		this.clock += deltaSeconds;
		const stride = Math.max(1, Math.round(1 / this.budget.updateFraction));
		const phase = Math.floor(this.clock * 60) % stride;
		for (let index = 0; index < this.cells.length; index += 1) {
			this.updateVisibility(this.cells[index], this.runtime.state);
			if (index % stride === phase || this.cells[index].reaction > 0) {
				this.updateCell(this.cells[index], index);
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
			}
		}
	}

	updateVisibility(cell, player) {
		const dx = cell.x - player.x;
		const dz = cell.z - player.z;
		cell.distanceSquared = dx * dx + dz * dz;
		const maximum = cell.budget?.visibilityDistance || this.budget.visibilityDistance;
		cell.group.visible = cell.distanceSquared <= maximum * maximum;
	}

<<<<<<< HEAD
=======
	updateCell(cell, index) {
		if (!cell.windMetadata) prepareCell(cell);
		const distanceSquared = cell.distanceSquared ?? 0;
		const reaction = distanceSquared >= INTERACTION_RADIUS_SQUARED
			? 0
			: 1 - Math.sqrt(distanceSquared) / INTERACTION_RADIUS;
		const ambient = Math.sin(this.clock * 1.15 + index * 1.37) * 0.025;
		cell.reaction = reaction;
		for (const metadata of cell.windMetadata) {
			metadata.windStrength = 0.045 + Math.abs(ambient) + reaction * 0.08;
		}
	}

>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
	diagnostics() {
		const activity = countMinimalMeadowVegetationActivity(this.cells);
		return {
			...minimalMeadowVegetationDiagnostics(this),
			budget: this.budget,
<<<<<<< HEAD
			reactiveCells: activity.reactive,
			visibleCells: activity.visible,
			wetCells: activity.wet
=======
			mounted: this.group.parent === this.runtime.scene,
			visibleCells: this.cells.filter(cell => cell.group.visible !== false).length
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.vegetation === this) this.runtime.vegetation = null;
	}
}
