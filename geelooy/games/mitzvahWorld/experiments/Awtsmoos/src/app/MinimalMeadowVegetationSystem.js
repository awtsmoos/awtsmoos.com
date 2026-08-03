// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationSystem.js
 * @description Keeps dense ecological cells visible and reactive through distance-aware staggered updates.
 * The Awtsmoos lets nearby blade and blossom answer the traveler while distant abundance rests;
 * Awtsmoos.com preserves every cell, full high quality, bounded arithmetic, and zero-allocation wind.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowVegetationCells } from './MinimalMeadowVegetationCells.js';
import {
	createMinimalMeadowVegetationCell
} from './MinimalMeadowVegetationDistributionCellFactory.js';
import {
	minimalMeadowVegetationDiagnostics
} from './MinimalMeadowWorldPopulationDiagnostics.js';
import {
	minimalMeadowVegetationBudget
} from './MinimalMeadowVegetationQualityBudget.js';

const INTERACTION_RADIUS = 7.5;
const INTERACTION_RADIUS_SQUARED = INTERACTION_RADIUS * INTERACTION_RADIUS;

export class MinimalMeadowVegetationSystem {
	constructor(runtime) {
		if (runtime.vegetation?.group) return runtime.vegetation;
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_seeded_ecological_vegetation';
		this.clock = 0;
		this.mobile = mobileProfile(runtime);
		this.budget = minimalMeadowVegetationBudget({
			mobile: this.mobile,
			quality: runtime.qualityProfile?.quality
		});
		this.specifications = createMinimalMeadowVegetationCells(runtime.terrain, {
			budget: this.budget,
			mobile: this.mobile,
			quality: this.budget.quality
		});
		this.cells = this.specifications.map(specification => prepareCell(
			createMinimalMeadowVegetationCell(specification, runtime.terrain)
		));
		for (const cell of this.cells) this.group.add(cell.group);
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		const player = this.runtime.state;
		const stride = Math.max(1, Math.round(1 / this.budget.updateFraction));
		const phase = Math.floor(this.clock * 60) % stride;
		for (let index = 0; index < this.cells.length; index += 1) {
			this.updateVisibility(this.cells[index], player);
			if (index % stride === phase || this.cells[index].reaction > 0) {
				this.updateCell(this.cells[index], player, index);
			}
		}
	}

	updateVisibility(cell, player) {
		const dx = cell.x - player.x;
		const dz = cell.z - player.z;
		const distanceSquared = dx * dx + dz * dz;
		const maximum = cell.budget?.visibilityDistance || this.budget.visibilityDistance;
		cell.group.visible = distanceSquared <= maximum * maximum;
		cell.distanceSquared = distanceSquared;
	}

	updateCell(cell, player, index) {
		if (!cell.windMetadata) prepareCell(cell);
		const distanceSquared = cell.distanceSquared ?? 0;
		const reaction = distanceSquared >= INTERACTION_RADIUS_SQUARED
			? 0
			: 1 - Math.sqrt(distanceSquared) / INTERACTION_RADIUS;
		const ambient = Math.sin(this.clock * 1.15 + index * 1.37) * 0.025;
		const windStrength = 0.045 + Math.abs(ambient) + reaction * 0.08;
		cell.reaction = reaction;
		for (const metadata of cell.windMetadata) metadata.windStrength = windStrength;
	}

	diagnostics() {
		return {
			...minimalMeadowVegetationDiagnostics(this),
			budget: this.budget,
			visibleCells: this.cells.filter(cell => cell.group.visible !== false).length
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.vegetation === this) this.runtime.vegetation = null;
	}
}

function prepareCell(cell) {
	cell.group.quaternion.set(0, 0, 0, 1);
	cell.windMetadata = cell.group.children.map(child => {
		child.userData ||= {};
		child.userData.AwtsmoosYardGrass ||= {
			interactionRadius: 2.4,
			reactsToPlayer: true,
			rooted: true,
			windStrength: 0.045
		};
		return child.userData.AwtsmoosYardGrass;
	});
	return cell;
}

function mobileProfile(runtime) {
	const environment = runtime.environment || globalThis;
	return Number(environment.innerWidth || 1024) <= 820
		|| Boolean(environment.matchMedia?.('(pointer: coarse)')?.matches);
}
