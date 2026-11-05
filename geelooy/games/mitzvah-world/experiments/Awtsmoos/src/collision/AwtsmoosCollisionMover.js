// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCollisionMover.js
 * @description Resolves a player capsule against real octree triangles with bounded finite steps.
 * The Awtsmoos renews traveler and wall without confusion; Awtsmoos.com measures each stride,
 * rejects impossible numbers, honors visible risers, and records the contact truth that remains.
 */

import { capsuleFor, deepestContact } from './CapsuleCollisionQuery.js';
import { collisionMoveReceipt, createCollisionMovePlan } from './CollisionMovePlan.js';

export class AwtsmoosCollisionMover {
	constructor({ octree, radius = 0.38, height = 1.72, footOffset = 0 }) {
		Object.assign(this, { octree, radius, height, footOffset });
		this.lastCeiling = null;
		this.lastMove = null;
		this.resetContacts();
	}
	move(position, delta, options = {}) {
		const plan = createCollisionMovePlan(delta, options.maximumSubstep);
		const start = { x: position.x, z: position.z };
		this.resetContacts();
		for (let index = 0; index < plan.substeps; index += 1) {
			position.x += plan.step.x;
			position.z += plan.step.z;
			this.solve(position, options);
		}
		this.lastMove = collisionMoveReceipt(plan, start, position);
		return {
			contacts: this.lastContacts.length,
			movement: this.lastMove,
			normals: this.lastNormals,
			steppedFaces: this.lastStepFaces
		};
	}
	solve(position, options) {
		for (let pass = 0; pass < 7; pass += 1) {
			const hit = this.deepestWall(this.capsule(position), options);
			if (!hit) return;
			position.x += hit.normal.x * hit.depth;
			position.z += hit.normal.z * hit.depth;
			this.remember(hit);
		}
	}
	resolveCeiling(position, options = {}) {
		let pushed = 0;
		this.lastCeiling = null;
		for (let pass = 0; pass < 4; pass += 1) {
			const hit = this.deepestCeiling(this.capsule(position), options);
			if (!hit) break;
			position.y += Math.min(-0.002, hit.normal.y * hit.depth);
			pushed += hit.depth;
			this.lastCeiling = hit;
		}
		return { depth: pushed, hit: !!this.lastCeiling, kind: this.lastCeiling?.kind || null };
	}
	ceilingHit(position, options = {}) {
		return this.deepestCeiling(this.capsule(position), options);
	}
	deepestWall(capsule, options) {
		return deepestContact({
			accept: (triangle, hit) => this.isBlockingWall(triangle, hit, capsule, options),
			capsule,
			octree: this.octree,
			options,
			radius: this.radius
		});
	}
	deepestCeiling(capsule, options) {
		return deepestContact({
			accept: (triangle, hit) => this.isBlockingCeiling(triangle, hit, capsule),
			capsule,
			octree: this.octree,
			options,
			radius: this.radius
		});
	}
	isBlockingCeiling(triangle, hit, capsule) {
		if (!triangle.solid || triangle.floor || triangle.normal.y > -0.18) return false;
		if (triangle.aabb.max.y < capsule.end.y - 0.46) return false;
		hit.normal = triangle.normal;
		return true;
	}
	isBlockingWall(triangle, hit, capsule, options) {
		const maxSlope = options.maxSlopeNormal ?? 0.72;
		if (!triangle.solid) return false;
		if (triangle.floor && triangle.normal.y >= maxSlope) return false;
		if (triangle.floor && options.blockSteepFloors === false) return false;
		if (Math.abs(hit.normal.y) > 0.76) return false;
		const floorY = options.floorY ?? capsule.start.y - 0.25;
		const stepTop = floorY + (options.maxStepHeight ?? 0);
		if (!triangle.floor && options.grounded && triangle.aabb.max.y <= stepTop + 0.045) {
			this.lastStepFaces.push(triangle.kind);
			return false;
		}
		return true;
	}
	resetContacts() {
		this.lastContacts = [];
		this.lastNormals = [];
		this.lastStepFaces = [];
	}
	remember(hit) {
		this.lastContacts.push(hit.kind);
		this.lastNormals.push({ ...hit.normal, depth: hit.depth });
	}
	capsule(position) {
		return capsuleFor(position, this.radius, this.height, this.footOffset);
	}
}
