// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationSystem.js
 * @description Owns allocation-free reactive vegetation cells across dry, moist, and riverbank zones.
 * The Awtsmoos lets the meadow answer each footstep without birthing garbage each frame;
 * Awtsmoos.com preserves one idempotent mount, shared ecological proof, and finite mobile bounds.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowVegetationCells } from './MinimalMeadowVegetationCells.js';
import { createMinimalMeadowVegetationCell } from './MinimalMeadowVegetationDistributionCellFactory.js';
import { minimalMeadowVegetationDiagnostics } from './MinimalMeadowWorldPopulationDiagnostics.js';

export class MinimalMeadowVegetationSystem {
	constructor(runtime) {
		if (runtime.vegetation?.group) {
			return runtime.vegetation;
		}
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_seeded_ecological_vegetation';
		this.clock = 0;
		this.mobile = mobileProfile(runtime);
		this.specifications = createMinimalMeadowVegetationCells(runtime.terrain, { mobile: this.mobile });
		this.cells = this.specifications.map(specification => {
			return createMinimalMeadowVegetationCell(specification, runtime.terrain);
		});
		for (const cell of this.cells) {
			this.group.add(cell.group);
		}
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		const player = this.runtime.state;
		for (let index = 0; index < this.cells.length; index += 1) {
			this.updateCell(this.cells[index], player, index);
		}
	}

	updateCell(cell, player, index) {
		const dx = cell.x - player.x;
		const dz = cell.z - player.z;
		const distance = Math.hypot(dx, dz);
		const reaction = Math.max(0, 1 - distance / 7.5);
		if (player.moving && Number.isFinite(player.travelFacing)) {
			cell.directionX = -Math.sin(player.travelFacing);
			cell.directionZ = -Math.cos(player.travelFacing);
		} else if (distance > 0.001) {
			cell.directionX = dx / distance;
			cell.directionZ = dz / distance;
		} else {
			cell.directionX = 0;
			cell.directionZ = 0;
		}
		cell.group.quaternion.z = Math.sin(this.clock * 1.15 + index * 1.37) * 0.025
			+ cell.directionX * reaction * 0.18;
		cell.group.quaternion.x = cell.directionZ * reaction * 0.12;
		cell.reaction = reaction;
	}

	diagnostics() {
		return minimalMeadowVegetationDiagnostics(this);
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.vegetation === this) {
			this.runtime.vegetation = null;
		}
	}
}

function mobileProfile(runtime) {
	const environment = runtime.environment || globalThis;
	return Number(environment.innerWidth || 1024) <= 820
		|| Boolean(environment.matchMedia?.('(pointer: coarse)')?.matches);
}
