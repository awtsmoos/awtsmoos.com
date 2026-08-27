// B"H
import {
	capsuleFor,
	deepestContact
} from './CapsuleCollisionQuery.js';
/** Resolves a capsule against actual octree triangles, including visible risers. */
export class AwtsmoosCollisionMover {
	constructor({ octree, radius = 0.38, height = 1.72, footOffset = 0 }) {
		Object.assign(this, { octree, radius, height, footOffset });
		this.lastCeiling = null;
		this.resetContacts();
	}

	move(position, delta, options = {}) {
		const count = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / 0.055));
		this.resetContacts();
		for (let index = 0; index < count; index += 1) {
			position.x += delta.x / count;
			position.z += delta.z / count;
			this.solve(position, options);
		}
		return {
			contacts: this.lastContacts.length,
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
		return {
			hit: !!this.lastCeiling,
			kind: this.lastCeiling?.kind || null,
			depth: pushed
		};
	}

	ceilingHit(position, options = {}) {
		return this.deepestCeiling(this.capsule(position), options);
	}

	deepestWall(capsule, options) {
		return deepestContact({
			octree: this.octree,
			capsule,
			radius: this.radius,
			options,
			accept: (triangle, hit) => this.isBlockingWall(triangle, hit, capsule, options)
		});
	}

	deepestCeiling(capsule, options) {
		return deepestContact({
			octree: this.octree,
			capsule,
			radius: this.radius,
			options,
			accept: (triangle, hit) => this.isBlockingCeiling(triangle, hit, capsule)
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
		this.lastNormals.push({
			x: hit.normal.x,
			y: hit.normal.y,
			z: hit.normal.z,
			depth: hit.depth
		});
	}
	capsule(position) {
		return capsuleFor(position, this.radius, this.height, this.footOffset);
	}
}
