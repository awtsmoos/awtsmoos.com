// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationSystem.js
 * @description Owns batched grass/flower cells with wind, proximity, and movement-direction bending.
 * The Awtsmoos lets the meadow answer footsteps without one object per blade; Awtsmoos.com
 * batches many clumps, follows travel direction at center, restores them, and cleans up truthfully.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { createMinimalMeadowFlowerCellGeometry } from './MinimalMeadowFlowerClumpGeometry.js?v=20260724-meadow-21';
import { createMinimalMeadowVegetationCells } from './MinimalMeadowVegetationCells.js?v=20260724-meadow-21';

export class MinimalMeadowVegetationSystem {
	constructor(runtime) {
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_baked_instance_reactive_flower_meadow';
		this.clock = 0;
		this.cells = createMinimalMeadowVegetationCells(runtime.terrain).map(specification => (
			createCell(specification, runtime.terrain)
		));
		for (const cell of this.cells) this.group.add(cell.group);
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		const player = this.runtime.state;
		for (let index = 0; index < this.cells.length; index += 1) {
			const cell = this.cells[index];
			const dx = cell.x - player.x;
			const dz = cell.z - player.z;
			const distance = Math.hypot(dx, dz);
			const reaction = Math.max(0, 1 - distance / 7.5);
			const direction = disturbanceDirection(player, dx, dz, distance);
			const wind = Math.sin(this.clock * 1.15 + index * 1.37) * 0.025;
			cell.group.quaternion.z = wind + direction.x * reaction * 0.18;
			cell.group.quaternion.x = direction.z * reaction * 0.12;
			cell.reaction = reaction;
			cell.disturbance = direction;
		}
	}

	diagnostics() {
		return {
			batchMode: 'baked-instance-cell-batches',
			cells: this.cells.length,
			clumps: this.cells.reduce((sum, cell) => sum + cell.clumps, 0),
			flowers: this.cells.reduce((sum, cell) => sum + cell.flowers, 0),
			movementReactive: true,
			reactiveCells: this.cells.filter(cell => cell.reaction > 0).length,
			worldMeshes: this.cells.length * 2
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
	}
}

function disturbanceDirection(player, dx, dz, distance) {
	if (player.moving && Number.isFinite(player.travelFacing)) {
		return {
			x: -Math.sin(player.travelFacing),
			z: -Math.cos(player.travelFacing)
		};
	}
	if (distance > 0.001) return { x: dx / distance, z: dz / distance };
	return { x: 0, z: 0 };
}

function createCell(specification, terrain) {
	const geometry = createMinimalMeadowFlowerCellGeometry({
		center: specification,
		clumps: specification.clumps,
		terrain
	});
	const group = new Group();
	group.name = specification.id;
	group.position.set(specification.x, specification.y, specification.z);
	group.add(manualMesh('grass', geometry.grass, '#4f8f39', geometry.clumps));
	group.add(manualMesh('flowers', geometry.petals, specification.color, geometry.clumps));
	group.userData.AwtsmoosVegetationCell = {
		batchMode: 'baked-instance-cell-batch',
		clumps: geometry.clumps,
		flowers: geometry.flowers
	};
	return {
		clumps: geometry.clumps,
		disturbance: { x: 0, z: 0 },
		flowers: geometry.flowers,
		group,
		reaction: 0,
		x: specification.x,
		z: specification.z
	};
}

function manualMesh(role, geometry, color, instances) {
	return createPrimitiveMesh({
		color,
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_${role}_baked_instances`,
		shape: 'manual',
		solid: false,
		transparent: false,
		userData: { instanceCount: instances, role }
	});
}
