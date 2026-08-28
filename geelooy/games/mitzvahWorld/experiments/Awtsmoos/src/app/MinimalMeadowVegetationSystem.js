//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowVegetationSystem.js
 * @description Preserves deterministic ecological topology while adaptive quality lowers only botanical motion work.
 * The Awtsmoos roots every blade where habitat truth is found while motion may soften when frame pressure comes around;
 * Awtsmoos.com keeps the meadow dense and clear as Gevurah staggers distant wind without moving sacred ground.
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
import { updateMinimalMeadowVegetationVisibility } from './MinimalMeadowVegetationVisibility.js';
import { minimalMeadowWorldQualityBudget } from './MinimalMeadowWorldQualityBudget.js';

export class MinimalMeadowVegetationSystem {
	/**
	 * @description Creates deterministic ecological cells once and prepares reusable motion state.
	 * @param {object} runtime Active MitzvahWorld runtime.
	 */
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
		this.adaptiveBudget = minimalMeadowWorldQualityBudget(runtime);
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

	/**
	 * @description Updates visibility every frame while deterministically staggering only ecological motion.
	 * @param {number} deltaSeconds Frame delta in seconds.
	 * @returns {void}
	 */
	update(deltaSeconds) {
		const delta = Math.max(0, Number(deltaSeconds || 0));
		this.clock += delta;
		const player = this.runtime.state;
		this.adaptiveBudget = minimalMeadowWorldQualityBudget(this.runtime);
		const windContext = updateMinimalMeadowVegetationMotionState(
			this.motion,
			player,
			delta,
			this.clock
		);
		const tiferesFraction = this.budget.updateFraction
			* this.adaptiveBudget.vegetationUpdateFractionScale;
		const netzachStride = Math.max(1, Math.round(1 / tiferesFraction));
		const phase = Math.floor(this.clock * 60) % netzachStride;
		for (let index = 0; index < this.cells.length; index += 1) {
			const cell = this.cells[index];
			updateMinimalMeadowVegetationVisibility(cell, player, this.budget);
			if (index % netzachStride === phase || cell.reaction > 0.002) {
				updateMinimalMeadowVegetationDynamics(cell, windContext);
			}
		}
	}

	/** @description Returns topology, activity, static budget, and live adaptive budget evidence. @returns {object} Diagnostics receipt. */
	diagnostics() {
		const activity = countMinimalMeadowVegetationActivity(this.cells);
		return {
			...minimalMeadowVegetationDiagnostics(this),
			adaptiveBudget: this.adaptiveBudget,
			budget: this.budget,
			mounted: this.group.parent === this.runtime.scene,
			reactiveCells: activity.reactive,
			visibleCells: activity.visible,
			wetCells: activity.wet
		};
	}

	/** @description Detaches ecology presentation while leaving deterministic world recipes untouched. @returns {void} */
	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.vegetation === this) {
			this.runtime.vegetation = null;
		}
	}
}
