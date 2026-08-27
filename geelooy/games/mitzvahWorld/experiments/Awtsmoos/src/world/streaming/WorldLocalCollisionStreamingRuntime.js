// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionStreamingRuntime.js
 * @description Applies bounded addition-first streaming over one reusable canonical source index.
 * The Awtsmoos renews each nearby vessel without recounting the distant whole;
 * Awtsmoos.com lets one indexed source feed movement, teleport safety, and collision control.
 */

import { DEFAULT_LOCAL_COLLISION_RADIUS } from './WorldLocalCollisionSelection.js';
import { WorldLocalCollisionMutationQueue } from './WorldLocalCollisionMutationQueue.js';
import { WorldLocalCollisionSourceIndex } from './WorldLocalCollisionSourceIndex.js';
import {
	LOCAL_COLLISION_OPERATION_BUDGET,
	createLocalCollisionStreamingPlan,
	isLocalCollisionDiscontinuity,
	normalizeLocalCollisionBudget,
	normalizeLocalCollisionPosition,
	resolveLocalCollisionDirection,
	shouldReplanLocalCollision
} from './WorldLocalCollisionStreamingPolicy.js';

export class WorldLocalCollisionStreamingRuntime {
	constructor({ octree, sourceIndex, sourceTriangles, terrainGridSteps } = {}) {
		if (!octree?.insert || !octree?.remove || !octree?.all) {
			throw new TypeError('An active Awtsmoos octree is required for local streaming.');
		}
		this.sourceIndex = sourceIndex || new WorldLocalCollisionSourceIndex({
			sourceTriangles,
			terrainGridSteps
		});
		this.octree = octree;
		this.activeTriangles = new Set(octree.all([]));
		this.queue = new WorldLocalCollisionMutationQueue();
		this.lastPlayerPosition = null;
		this.lastPlanPosition = null;
		this.lastPlanCenter = null;
		this.totalInserted = 0;
		this.totalRemoved = 0;
		this.emergencyBubbleCount = 0;
	}

	update({ playerPosition, maximumOperations = LOCAL_COLLISION_OPERATION_BUDGET } = {}) {
		const position = normalizeLocalCollisionPosition(playerPosition);
		const previous = this.lastPlayerPosition;
		if (isLocalCollisionDiscontinuity(previous, position)) {
			this.ensureLocalCollision(position);
			this.emergencyBubbleCount += 1;
		}
		const direction = resolveLocalCollisionDirection(previous, position);
		this.lastPlayerPosition = position;
		if (shouldReplanLocalCollision(this.lastPlanPosition, position)) this.replan(position, direction);
		const processed = this.queue.process({
			activeTriangles: this.activeTriangles,
			budget: normalizeLocalCollisionBudget(maximumOperations),
			octree: this.octree,
			onInsert: () => { this.totalInserted += 1; },
			onRemove: () => { this.totalRemoved += 1; }
		});
		return Object.freeze({ processed, ...this.diagnostics() });
	}

	ensureLocalCollision(position, radius = DEFAULT_LOCAL_COLLISION_RADIUS) {
		const selection = this.sourceIndex.query(position, radius);
		let inserted = 0;
		for (const triangle of selection.triangles) {
			if (this.activeTriangles.has(triangle) || !this.octree.insert(triangle)) continue;
			this.activeTriangles.add(triangle);
			this.totalInserted += 1;
			inserted += 1;
		}
		this.lastPlanPosition = null;
		return Object.freeze({ inserted, radius: selection.radius });
	}

	replan(position, direction) {
		const plan = createLocalCollisionStreamingPlan({
			activeTriangles: this.activeTriangles,
			direction,
			position,
			sourceIndex: this.sourceIndex
		});
		this.queue.reset(plan.additions, plan.removals);
		this.lastPlanPosition = position;
		this.lastPlanCenter = plan.center;
	}

	diagnostics() {
		return Object.freeze({
			activeTriangleCount: this.activeTriangles.size,
			source: this.sourceIndex.diagnostics(),
			totalInserted: this.totalInserted,
			totalRemoved: this.totalRemoved,
			emergencyBubbleCount: this.emergencyBubbleCount,
			lastPlanCenter: this.lastPlanCenter,
			...this.queue.diagnostics()
		});
	}
}
