// B"H
import { MAX_SLOPE_NORMAL, MAX_STEP, PLAYER_HEIGHT, PLAYER_RADIUS } from '../../app/EretzConstants.js';
import { AwtsmoosCollisionMover } from '../../collision/AwtsmoosCollisionMover.js';
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import { Aabb } from '../../math/Aabb.js';
import { WorldGround } from '../WorldGround.js';
import { collisionTrianglesForRamp } from './StairCollisionRamp.js';
import { localToWorld } from './HouseSpec.js';

/** Runs the real capsule mover over the generated ramp in both directions. */
export function inspectStairTraversal(layout, spec, rampDefinition, sampleCount = 96) {
	const triangles = collisionTrianglesForRamp(rampDefinition);
	const octree = new AwtsmoosOctree(new Aabb(
		{ x: spec.x - 100, y: layout.fromY - 10, z: spec.z - 100 },
		{ x: spec.x + 100, y: layout.toY + 20, z: spec.z + 100 }
	));
	for (const triangle of triangles) {
		octree.insert(triangle);
	}
	const ground = new WorldGround({
		terrainHeightAt: () => layout.fromY - 0.2,
		octree,
		top: layout.toY + 10
	});
	const mover = new AwtsmoosCollisionMover({
		octree,
		radius: PLAYER_RADIUS,
		height: PLAYER_HEIGHT,
		footOffset: 0
	});
	const path = stairPath(layout, spec, sampleCount);
	const ascent = traverse(path, layout.fromY, ground, mover);
	const descent = traverse([...path].reverse(), layout.toY, ground, mover);
	const collision = rampDefinition.userData.AwtsmoosStairCollision;
	return {
		...collision,
		sampledHeights: ascent.heights,
		monotonicAscent: monotonic(ascent.heights, 0.0001),
		ascendingWallContacts: ascent.wallContacts,
		descendingWallContacts: descent.wallContacts,
		penetrations: [...ascent.penetrations, ...descent.penetrations],
		reachesUpperFloor: Math.abs(ascent.finalY - layout.toY) < 0.12,
		reachesLowerFloor: Math.abs(descent.finalY - layout.fromY) < 0.12,
		ascentFinalY: ascent.finalY,
		descentFinalY: descent.finalY,
		triangleNormals: triangles.map((triangle) => triangle.normal)
	};
}

function stairPath(layout, spec, sampleCount) {
	const first = layout.steps[0];
	const last = layout.steps[layout.steps.length - 1];
	const lowZ = first.centerZ + first.depth / 2;
	const highZ = last.centerZ - last.depth / 2;
	const edgeInset = 0.002;
	return Array.from({ length: sampleCount + 1 }, (_, index) => {
		const rawProgress = index / sampleCount;
		const progress = edgeInset + rawProgress * (1 - edgeInset * 2);
		const localZ = lowZ + (highZ - lowZ) * progress;
		return localToWorld(spec, layout.lowerLanding.centerX, localZ);
	});
}

function traverse(path, initialY, ground, mover) {
	const state = { x: path[0].x, y: initialY, z: path[0].z };
	const heights = [initialY];
	const wallContacts = [];
	const penetrations = [];
	for (const target of path.slice(1)) {
		const sample = ground.sample(target.x, target.z, { maxY: state.y + MAX_STEP });
		if (sample.normal.y >= MAX_SLOPE_NORMAL && Math.abs(sample.height - state.y) <= MAX_STEP) {
			state.y = sample.height;
		}
		mover.move(state, {
			x: target.x - state.x,
			z: target.z - state.z
		}, {
			grounded: true,
			floorY: state.y,
			maxStepHeight: MAX_STEP,
			maxSlopeNormal: MAX_SLOPE_NORMAL,
			blockSteepFloors: true
		});
		if (mover.lastContacts.length) {
			wallContacts.push(...mover.lastContacts);
		}
		const settled = ground.sample(state.x, state.z, { maxY: state.y + MAX_STEP });
		if (state.y < settled.height - 0.002) {
			penetrations.push({ x: state.x, y: state.y, z: state.z, floorY: settled.height });
		}
		state.y = settled.height;
		heights.push(state.y);
	}
	return { finalY: state.y, heights, wallContacts, penetrations };
}

function monotonic(values, epsilon) {
	return values.every((value, index) => index === 0 || value + epsilon >= values[index - 1]);
}
