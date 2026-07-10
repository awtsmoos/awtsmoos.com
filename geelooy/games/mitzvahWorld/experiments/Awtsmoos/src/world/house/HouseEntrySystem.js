// B"H
import { createDoorWallSet } from '../DoorWallSystem.js';
import { createMezuzaDef } from '../MezuzaSystem.js';
import { createHouseBox } from './HouseBox.js';
import {
	floorTopY,
	localToWorld
} from './HouseSpec.js';

/** Builds one exact front frame, its fixed mezuzah, landing, and approach. */
export function createHouseEntry(spec, materials, sampler) {
	const wallPoint = localToWorld(spec, 0, spec.depth / 2 - spec.wallT / 2);
	const frameInput = {
		id: `${spec.id}-front`,
		houseId: spec.id,
		wallId: `${spec.id}-front-wall`,
		doorId: `${spec.id}-front-door`,
		x: wallPoint.x,
		z: wallPoint.z,
		floorY: spec.floorY,
		openingBottomY: floorTopY(spec, 0),
		yaw: spec.yaw,
		wallW: spec.width,
		wallH: spec.wallH,
		wallT: spec.wallT,
		doorW: spec.doorW,
		doorH: spec.doorH,
		doorThickness: 0.24,
		panelGap: 0.08,
		openAngle: -Math.PI * 0.54,
		noEdge: true
	};
	const set = createDoorWallSet(frameInput, {
		...materials.wall,
		doorMaterial: materials.door
	});
	return {
		...set,
		mezuza: createMezuzaDef(set.spec, materials.mezuza),
		steps: createEntrySteps(spec, materials.stone, sampler),
		anchors: entryAnchors(spec)
	};
}

export function entryAnchors(spec) {
	return {
		door: localToWorld(spec, 0, spec.depth / 2 + 0.8),
		landing: localToWorld(spec, 0, spec.depth / 2 + 2.2),
		gate: localToWorld(spec, 0, spec.depth / 2 + 8.2),
		outward: spec.yaw
	};
}

function createEntrySteps(spec, material, sampler) {
	if (!sampler) {
		return [];
	}
	const targetY = floorTopY(spec, 0);
	const baseZ = spec.depth / 2 + 6.2;
	const base = sample(spec, sampler, baseZ);
	const count = Math.max(3, Math.min(10, Math.ceil(Math.max(0.2, targetY - base.y) / 0.24)));
	const definitions = [];
	for (let index = 0; index < count; index += 1) {
		const progress = index / Math.max(1, count - 1);
		const localZ = baseZ - index * 0.72;
		const ground = sample(spec, sampler, localZ);
		const topY = ground.y + (targetY - ground.y) * progress;
		definitions.push(step(spec, material, index, localZ, topY));
	}
	definitions.push(createHouseBox({
		id: `${spec.id}-door-landing`, material, spec, y: targetY - 0.1,
		localZ: spec.depth / 2 + 1, sizeX: spec.doorW + 4.4,
		sizeY: 0.2, sizeZ: 2.4, walkable: true
	}));
	return definitions;
}

function step(spec, material, index, localZ, topY) {
	return createHouseBox({
		id: `${spec.id}-entry-step-${index + 1}`, material, spec,
		y: topY - 0.12, localZ, sizeX: spec.doorW + 3.6,
		sizeY: 0.24, sizeZ: 0.76, walkable: true
	});
}

function sample(spec, sampler, localZ) {
	const point = localToWorld(spec, 0, localZ);
	return sampler.heightAt(point.x, point.z);
}
