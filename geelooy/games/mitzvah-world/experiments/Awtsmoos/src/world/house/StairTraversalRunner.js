// B"H
import {
	MAX_SLOPE_NORMAL,
	MAX_STEP,
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from '../../app/EretzConstants.js';
import { AwtsmoosCollisionMover } from '../../collision/AwtsmoosCollisionMover.js';
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import {
	applyWalkableStep,
	findWalkableStep
} from '../../collision/StepUpResolver.js';
import { Aabb } from '../../math/Aabb.js';
import { WorldGround } from '../WorldGround.js';
import {
	lateralTraversalOffsets,
	stairTraversalPath
} from './StairTraversalPath.js';

export function runStairTraversals(layout, spec, triangles) {
	const octree = createOctree(spec, layout, triangles);
	const ground = new WorldGround({
		terrainHeightAt: () => layout.fromY - 0.22,
		octree,
		top: layout.toY + 10
	});
	return lateralTraversalOffsets(layout).map((offset) => {
		const path = stairTraversalPath(layout, spec, offset);
		return {
			offset,
			ascent: traverse(path, layout.fromY, ground, octree),
			descent: traverse([...path].reverse(), layout.toY, ground, octree)
		};
	});
}

function createOctree(spec, layout, triangles) {
	const octree = new AwtsmoosOctree(new Aabb(
		{ x: spec.x - 100, y: layout.fromY - 10, z: spec.z - 100 },
		{ x: spec.x + 100, y: layout.toY + 20, z: spec.z + 100 }
	));
	for (const triangle of triangles) octree.insert(triangle);
	return octree;
}

function traverse(path, initialY, ground, octree) {
	const mover = new AwtsmoosCollisionMover({
		octree,
		radius: PLAYER_RADIUS,
		height: PLAYER_HEIGHT,
		footOffset: 0
	});
	const state = { x: path[0].x, y: initialY, z: path[0].z };
	const heights = [initialY];
	const contacts = [];
	const penetrations = [];
	for (const target of path.slice(1)) {
		const delta = { x: target.x - state.x, z: target.z - state.z };
		const step = findWalkableStep({
			ground,
			position: state,
			delta,
			footOffset: 0,
			radius: PLAYER_RADIUS,
			maxStep: MAX_STEP,
			maxSlopeNormal: MAX_SLOPE_NORMAL
		});
		applyWalkableStep(state, step, 0);
		mover.move(state, delta, moveOptions(state));
		contacts.push(...mover.lastContacts);
		settle(state, ground);
		if (!postResolutionFits(state, ground)) {
			penetrations.push({ x: state.x, y: state.y, z: state.z });
		}
		heights.push(state.y);
	}
	return {
		finalY: state.y,
		heights,
		contacts,
		penetrations,
		middle: heights[Math.floor(heights.length / 2)]
	};
}

function moveOptions(state) {
	return {
		grounded: true,
		floorY: state.y,
		maxStepHeight: MAX_STEP,
		maxSlopeNormal: MAX_SLOPE_NORMAL,
		blockSteepFloors: true
	};
}

function settle(state, ground) {
	const sample = ground.sample(state.x, state.z, {
		maxY: state.y + MAX_STEP + 0.025
	});
	if (sample.normal.y >= MAX_SLOPE_NORMAL) state.y = sample.height;
}

function postResolutionFits(state, ground) {
	const sample = ground.sample(state.x, state.z, {
		maxY: state.y + 0.025
	});
	return Math.abs(state.y - sample.height) <= 0.003;
}
