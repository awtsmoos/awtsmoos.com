// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionTriangleIdentity.js
 * @description Gives cloned boundary triangles one deterministic geometric identity.
 * The Awtsmoos may reveal one face through neighboring vessels; Awtsmoos.com keeps
 * that face singular in collision by remembering its exact vertices and properties.
 */
export class WorldChunkCollisionTriangleIdentity {
	constructor() {
		this.cachedKeys = new WeakMap();
		this.fallbackIds = new WeakMap();
		this.nextFallbackId = 1;
	}

	/** Returns one stable identity for a collider or test-double object. */
	keyFor(triangle) {
		if (!isReference(triangle)) {
			return `${typeof triangle}:${String(triangle)}`;
		}
		if (this.cachedKeys.has(triangle)) {
			return this.cachedKeys.get(triangle);
		}
		const key = hasTriangleVertices(triangle)
			? geometricTriangleKey(triangle)
			: this.fallbackKey(triangle);
		this.cachedKeys.set(triangle, key);
		return key;
	}

	fallbackKey(value) {
		if (!this.fallbackIds.has(value)) {
			this.fallbackIds.set(value, this.nextFallbackId);
			this.nextFallbackId += 1;
		}
		return `object:${this.fallbackIds.get(value)}`;
	}
}

/** Appends only geometrically unique triangles to the caller's output array. */
export function appendUniqueCollisionTriangles(
	triangles,
	output,
	identity,
	seen = new Set()
) {
	let duplicatesRemoved = 0;
	for (const triangle of triangles) {
		const key = identity.keyFor(triangle);
		if (seen.has(key)) {
			duplicatesRemoved += 1;
			continue;
		}
		seen.add(key);
		output.push(triangle);
	}
	return duplicatesRemoved;
}

function geometricTriangleKey(triangle) {
	const vertices = [triangle.a, triangle.b, triangle.c]
		.map(vectorKey)
		.sort()
		.join(';');
	return [
		'triangle',
		String(triangle.kind || ''),
		triangle.solid !== false ? 'solid' : 'open',
		triangle.floor ? 'floor' : 'wall',
		vertices
	].join('|');
}

function vectorKey(vector) {
	return [vector.x, vector.y, vector.z]
		.map((component) => Number(component).toString())
		.join(',');
}

function hasTriangleVertices(value) {
	return [value.a, value.b, value.c].every((vector) => (
		vector
		&& [vector.x, vector.y, vector.z].every(Number.isFinite)
	));
}

function isReference(value) {
	return !!value && (
		typeof value === 'object'
		|| typeof value === 'function'
	);
}
