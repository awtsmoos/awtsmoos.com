// B"H
import {
	Box3,
	Line3,
	Plane,
	Sphere,
	Triangle,
	Vector3
} from '/games/scripts/build/three.module.js';
import { Capsule } from '../math/Capsule.js';

// --- Reusable private variables ---
const _v1 = new Vector3();
const _v2 = new Vector3();
const _plane = new Plane();
const _line1 = new Line3();
const _line2 = new Line3();
const _sphere = new Sphere();
const _capsule = new Capsule();
const _temp_triangle = new Triangle();
const _temp_box = new Box3();

const MAX_DEPTH = 55;

/**
 * @class InternalOctree
 * @description A complete, fast, and self-contained Octree used internally for each spatial chunk.
 * This class is not exported and is invisible to the user of the main Octree class.
 */
class InternalOctree {
	#worldTrianglesData;

	constructor(triangles) {
		this.triangles = [];
		this.subTrees = [];
		this.box = new Box3();

		this.#worldTrianglesData = new Float32Array(triangles.length * 9);
		for (let i = 0; i < triangles.length; i++) {
			const tri = triangles[i];
			const baseIndex = i * 9;
			this.#worldTrianglesData[baseIndex] = tri.a.x;
			this.#worldTrianglesData[baseIndex + 1] = tri.a.y;
			this.#worldTrianglesData[baseIndex + 2] = tri.a.z;
			this.#worldTrianglesData[baseIndex + 3] = tri.b.x;
			this.#worldTrianglesData[baseIndex + 4] = tri.b.y;
			this.#worldTrianglesData[baseIndex + 5] = tri.b.z;
			this.#worldTrianglesData[baseIndex + 6] = tri.c.x;
			this.#worldTrianglesData[baseIndex + 7] = tri.c.y;
			this.#worldTrianglesData[baseIndex + 8] = tri.c.z;
		}
		
		this.build();
	}

	build() { this.calcBox(); this.split(0); }

	calcBox() {
		const triCount = this.#getTriangleCount();
		this.triangles = Array.from(Array(triCount).keys());
		this.box.makeEmpty();
		for (let i = 0; i < triCount; i++) {
			const tri = this.#_getTriangle(i, _temp_triangle);
			this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
		}
		this.box.min.x -= 0.01; this.box.min.y -= 0.01; this.box.min.z -= 0.01;
	}

	split(level) {
		this.subTrees = [];
		const subTrees = [];
		const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);

		for (let x = 0; x < 2; x++) { for (let y = 0; y < 2; y++) { for (let z = 0; z < 2; z++) {
			const box = new Box3();
			_v1.set(x, y, z);
			box.min.copy(this.box.min).add(_v1.multiply(halfsize));
			box.max.copy(box.min).add(halfsize);
			// Create a dummy InternalOctree to hold data. It won't be built.
			const subTree = new InternalOctree([]); 
			subTree.box = box;
			subTree.#worldTrianglesData = this.#worldTrianglesData;
			subTrees.push(subTree);
		}}}

		let index;
		while ((index = this.triangles.pop()) !== undefined) {
			const tri = this.#_getTriangle(index, _temp_triangle);
			for (const subTree of subTrees) {
				if (subTree.box.intersectsTriangle(tri)) {
					subTree.triangles.push(index);
				}
			}
		}

		for (const subTree of subTrees) {
			const len = subTree.triangles.length;
			if (len > 8 && level < MAX_DEPTH) {
				subTree.split(level + 1);
			}
			if (len !== 0) {
				this.subTrees.push(subTree);
			}
		}
	}

	capsuleIntersect(capsule) {
		if (!this.box.intersectsBox(capsule.toBox(_temp_box))) return false;
		const triangles = [];
		let result, hit = false;
		const tempCapsule = capsule.clone();

		this.getCapsuleTriangles(tempCapsule, triangles);

		for (const index of triangles) {
			const tri = this.#_getTriangle(index, _temp_triangle);
			if (result = this._triangleCapsuleIntersect(tempCapsule, tri)) {
				hit = true;
				tempCapsule.translate(result.normal.multiplyScalar(result.depth));
			}
		}

		if (hit) {
			const collisionVector = tempCapsule.getCenter(_v1).sub(capsule.getCenter(_v2));
			if (collisionVector.lengthSq() > 1e-10) {
				const depth = collisionVector.length();
				return { normal: collisionVector.normalize(), depth: depth };
			}
		}
		return false;
	}

	rayIntersect(ray) {
		if (!ray.intersectsBox(this.box)) return false;
		const triangles = [];
		let closestResult = false;
		this.getRayTriangles(ray, triangles);

		for (const index of triangles) {
			const tri = this.#_getTriangle(index, _temp_triangle);
			const result = ray.intersectTriangle(tri.a, tri.b, tri.c, false, _v1);
			if (result) {
				const distSq = ray.origin.distanceToSquared(result);
				if (!closestResult || distSq < closestResult.distance * closestResult.distance) {
					closestResult = {
						distance: Math.sqrt(distSq),
						triangle: tri.clone(),
						position: result.clone()
					};
				}
			}
		}
		return closestResult;
	}

	getCapsuleTriangles(capsule, triangles) {
		if (this.subTrees.length > 0) {
			for (const subTree of this.subTrees) {
				if (capsule.intersectsBox(subTree.box)) {
					subTree.getCapsuleTriangles(capsule, triangles);
				}
			}
		} else {
			for (const index of this.triangles) {
				if (triangles.indexOf(index) === -1) triangles.push(index);
			}
		}
	}

	getRayTriangles(ray, triangles) {
		if (this.subTrees.length > 0) {
			for (const subTree of this.subTrees) {
				if (ray.intersectsBox(subTree.box)) {
					subTree.getRayTriangles(ray, triangles);
				}
			}
		} else {
			for (const index of this.triangles) {
				if (triangles.indexOf(index) === -1) triangles.push(index);
			}
		}
	}
	
	_triangleCapsuleIntersect(capsule, triangle) {
		triangle.getPlane(_plane);
		const d1 = _plane.distanceToPoint(capsule.start) - capsule.radius;
		const d2 = _plane.distanceToPoint(capsule.end) - capsule.radius;
		if ((d1 > 0 && d2 > 0) || (d1 < -capsule.radius && d2 < -capsule.radius)) return false;
		const delta = Math.abs(d1 / (Math.abs(d1) + Math.abs(d2)));
		const intersectPoint = _v1.copy(capsule.start).lerp(capsule.end, delta);
		if (triangle.containsPoint(intersectPoint)) {
			return { normal: _plane.normal.clone(), point: intersectPoint.clone(), depth: Math.abs(Math.min(d1, d2)) };
		}
		const r2 = capsule.radius * capsule.radius;
		_line1.set(capsule.start, capsule.end);
		const lines = [[triangle.a, triangle.b], [triangle.b, triangle.c], [triangle.c, triangle.a]];
		for (let i = 0; i < lines.length; i++) {
			_line2.set(lines[i][0], lines[i][1]);
			const [point1, point2] = capsule.lineLineMinimumPoints(_line1, _line2);
			if (point1.distanceToSquared(point2) < r2) {
				return { normal: point1.clone().sub(point2).normalize(), point: point2.clone(), depth: capsule.radius - point1.distanceTo(point2) };
			}
		}
		return false;
	}
	
	#getTriangleCount() { return this.#worldTrianglesData ? this.#worldTrianglesData.length / 9 : 0; }
	#_getTriangle(index, target) {
		const base = index * 9;
		target.a.fromArray(this.#worldTrianglesData, base);
		target.b.fromArray(this.#worldTrianglesData, base + 3);
		target.c.fromArray(this.#worldTrianglesData, base + 6);
		return target;
	}
}

/**
 * @class Octree
 * @description The public-facing, dynamic, lazy-loading, and spatially partitioned Octree.
 */
export class Octree {
	#chunkSize;
	#unbuiltTriangles = new Map();
	#builtChunks = new Map();
	box = new Box3();

	constructor(chunkSize = 32) {
		this.#chunkSize = chunkSize;
	}

	fromGraphNode(group) {
		group.updateWorldMatrix(true, true);
		group.traverse(mesh => {
			if (mesh.isMesh) {
				let geometry, isTemp = false;
				if (mesh.geometry.index !== null) {
					isTemp = true;
					geometry = mesh.geometry.toNonIndexed();
				} else {
					geometry = mesh.geometry;
				}
				const positionAttribute = geometry.getAttribute('position');
				if (positionAttribute) {
					for (let i = 0; i < positionAttribute.count; i += 3) {
						const v1 = new Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(mesh.matrixWorld);
						const v2 = new Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(mesh.matrixWorld);
						const v3 = new Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(mesh.matrixWorld);
						const tri = new Triangle(v1, v2, v3);

						this.box.expandByPoint(v1).expandByPoint(v2).expandByPoint(v3);
						_temp_box.setFromPoints([v1, v2, v3]);
						const minChunk = this.#getChunkCoords(_temp_box.min);
						const maxChunk = this.#getChunkCoords(_temp_box.max);

						for (let x = minChunk.x; x <= maxChunk.x; x++) {
							for (let y = minChunk.y; y <= maxChunk.y; y++) {
								for (let z = minChunk.z; z <= maxChunk.z; z++) {
									const key = `${x},${y},${z}`;
									if (!this.#unbuiltTriangles.has(key)) this.#unbuiltTriangles.set(key, []);
									this.#unbuiltTriangles.get(key).push(tri);
								}
							}
						}
					}
				}
				if (isTemp) geometry.dispose();
			}
		});
		return this;
	}
	
	#getChunkCoords(position) {
		const { chunkSize } = this;
		return {
			x: Math.floor(position.x / chunkSize),
			y: Math.floor(position.y / chunkSize),
			z: Math.floor(position.z / chunkSize)
		};
	}

	#getOrBuildChunk(key) {
		if (this.#builtChunks.has(key)) return this.#builtChunks.get(key);
		if (this.#unbuiltTriangles.has(key)) {
			const triangles = this.#unbuiltTriangles.get(key);
			const chunk = new InternalOctree(triangles);
			this.#builtChunks.set(key, chunk);
			this.#unbuiltTriangles.delete(key);
			return chunk;
		}
		return null;
	}

	capsuleIntersect(capsule) {
		if (!capsule.intersectsBox(this.box)) return false;

		let hit = false;
		const tempCapsule = capsule.clone();
		capsule.getBoundingBox(_temp_box);
		const minChunk = this.#getChunkCoords(_temp_box.min);
		const maxChunk = this.#getChunkCoords(_temp_box.max);

		for (let x = minChunk.x; x <= maxChunk.x; x++) {
			for (let y = minChunk.y; y <= maxChunk.y; y++) {
				for (let z = minChunk.z; z <= maxChunk.z; z++) {
					const key = `${x},${y},${z}`;
					const chunk = this.#getOrBuildChunk(key);
					if (chunk) {
						const result = chunk.capsuleIntersect(tempCapsule);
						if (result) {
							hit = true;
							tempCapsule.translate(result.normal.multiplyScalar(result.depth));
						}
					}
				}
			}
		}

		if (hit) {
			const collisionVector = tempCapsule.getCenter(_v1).sub(capsule.getCenter(_v2));
			if (collisionVector.lengthSq() > 1e-10) {
				const depth = collisionVector.length();
				return { normal: collisionVector.normalize(), depth: depth };
			}
		}
		return false;
	}

	rayIntersect(ray) {
		if (!ray.intersectsBox(this.box)) return false;

		let closestResult = false;
		const { chunkSize } = this;
		const invDir = new Vector3(1 / ray.direction.x, 1 / ray.direction.y, 1 / ray.direction.z);
		
		let tmin = -Infinity, tmax = Infinity;

		for(const axis of ['x', 'y', 'z']) {
			if (ray.direction[axis] === 0) {
				if (ray.origin[axis] < this.box.min[axis] || ray.origin[axis] > this.box.max[axis]) return false;
			} else {
				const t1 = (this.box.min[axis] - ray.origin[axis]) * invDir[axis];
				const t2 = (this.box.max[axis] - ray.origin[axis]) * invDir[axis];
				tmin = Math.max(tmin, Math.min(t1, t2));
				tmax = Math.min(tmax, Math.max(t1, t2));
			}
		}

		if(tmax < 0 || tmin > tmax) return false;

		const startPoint = ray.at(Math.max(0, tmin), _v1);
		
		let currentChunkX = Math.floor(startPoint.x / chunkSize);
		let currentChunkY = Math.floor(startPoint.y / chunkSize);
		let currentChunkZ = Math.floor(startPoint.z / chunkSize);

		const stepX = Math.sign(ray.direction.x);
		const stepY = Math.sign(ray.direction.y);
		const stepZ = Math.sign(ray.direction.z);

		const nextBoundX = (currentChunkX + (stepX > 0 ? 1 : 0)) * chunkSize;
		const nextBoundY = (currentChunkY + (stepY > 0 ? 1 : 0)) * chunkSize;
		const nextBoundZ = (currentChunkZ + (stepZ > 0 ? 1 : 0)) * chunkSize;

		let tMaxX = ray.direction.x !== 0 ? (nextBoundX - ray.origin.x) * invDir.x : Infinity;
		let tMaxY = ray.direction.y !== 0 ? (nextBoundY - ray.origin.y) * invDir.y : Infinity;
		let tMaxZ = ray.direction.z !== 0 ? (nextBoundZ - ray.origin.z) * invDir.z : Infinity;
		
		const tDeltaX = ray.direction.x !== 0 ? Math.abs(chunkSize * invDir.x) : Infinity;
		const tDeltaY = ray.direction.y !== 0 ? Math.abs(chunkSize * invDir.y) : Infinity;
		const tDeltaZ = ray.direction.z !== 0 ? Math.abs(chunkSize * invDir.z) : Infinity;

		// Limit to a reasonable number of chunks to prevent infinite loops from floating point errors
		for (let i = 0; i < 200; i++) {
			const key = `${currentChunkX},${currentChunkY},${currentChunkZ}`;
			const chunk = this.#getOrBuildChunk(key); // Lazy builds here
			if (chunk) {
				const result = chunk.rayIntersect(ray);
				if (result) {
					if (!closestResult || result.distance < closestResult.distance) {
						closestResult = result;
					}
				}
			}

			if (tMaxX < tMaxY) {
				if (tMaxX < tMaxZ) {
					if (closestResult && tMaxX > closestResult.distance) break;
					currentChunkX += stepX;
					tMaxX += tDeltaX;
				} else {
					if (closestResult && tMaxZ > closestResult.distance) break;
					currentChunkZ += stepZ;
					tMaxZ += tDeltaZ;
				}
			} else {
				if (tMaxY < tMaxZ) {
					if (closestResult && tMaxY > closestResult.distance) break;
					currentChunkY += stepY;
					tMaxY += tDeltaY;
				} else {
					if (closestResult && tMaxZ > closestResult.distance) break;
					currentChunkZ += stepZ;
					tMaxZ += tDeltaZ;
				}
			}
		}

		return closestResult;
	}
}