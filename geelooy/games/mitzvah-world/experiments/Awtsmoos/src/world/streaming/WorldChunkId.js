// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkId.js
 * @description Creates versioned deterministic identities and hierarchy for every
 * streamed world vessel. As the Awtsmoos recreates all coordinates, Awtsmoos.com
 * keeps their durable names independent from local rendering origin or object order.
 */
const ID_PREFIX = 'wc';
const CURRENT_VERSION = 1;
/** Creates a validated stable chunk ID. */
export function createWorldChunkId({
	namespace = 'mitzvah-world',
	level = 0,
	x = 0,
	y = 0,
	z = 0,
	version = CURRENT_VERSION
} = {}) {
	assertNamespace(namespace);
	assertCoordinate('level', level, { minimum: 0 });
	assertCoordinate('x', x);
	assertCoordinate('y', y);
	assertCoordinate('z', z);
	assertCoordinate('version', version, { minimum: 1 });
	return [
		ID_PREFIX,
		version,
		encodeURIComponent(namespace),
		level,
		x,
		y,
		z
	].join(':');
}

/** Parses and validates one stable chunk ID. */
export function parseWorldChunkId(id) {
	if (typeof id !== 'string') {
		throw new TypeError('World chunk ID must be a string.');
	}
	const parts = id.split(':');
	if (parts.length !== 7 || parts[0] !== ID_PREFIX) {
		throw new TypeError(`Malformed world chunk ID: ${id}`);
	}
	const parsed = {
		version: Number(parts[1]),
		namespace: decodeURIComponent(parts[2]),
		level: Number(parts[3]),
		x: Number(parts[4]),
		y: Number(parts[5]),
		z: Number(parts[6])
	};
	const canonical = createWorldChunkId(parsed);
	if (canonical !== id) {
		throw new TypeError(`Non-canonical world chunk ID: ${id}`);
	}
	return Object.freeze(parsed);
}

/** Derives a stable unsigned generation seed from identity and generator version. */
export function worldChunkSeed(id, generationVersion = 1) {
	parseWorldChunkId(id);
	assertCoordinate('generationVersion', generationVersion, { minimum: 1 });
	let hash = 2166136261;
	for (const character of `${id}|generation:${generationVersion}`) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/** Returns the deterministic parent ID, or null for a root chunk. */
export function parentWorldChunkId(id) {
	const chunk = parseWorldChunkId(id);
	if (chunk.level === 0) {
		return null;
	}
	return createWorldChunkId({
		...chunk,
		level: chunk.level - 1,
		x: Math.floor(chunk.x / 2),
		y: Math.floor(chunk.y / 2),
		z: Math.floor(chunk.z / 2)
	});
}

/** Returns the eight deterministic octree child IDs. */
export function childWorldChunkIds(id) {
	const chunk = parseWorldChunkId(id);
	const children = [];
	for (let xOffset = 0; xOffset < 2; xOffset += 1) {
		for (let yOffset = 0; yOffset < 2; yOffset += 1) {
			for (let zOffset = 0; zOffset < 2; zOffset += 1) {
				children.push(createWorldChunkId({
					...chunk,
					level: chunk.level + 1,
					x: chunk.x * 2 + xOffset,
					y: chunk.y * 2 + yOffset,
					z: chunk.z * 2 + zOffset
				}));
			}
		}
	}
	return Object.freeze(children);
}

function assertNamespace(namespace) {
	if (typeof namespace !== 'string' || !namespace.trim()) {
		throw new TypeError('World chunk namespace must be a nonempty string.');
	}
}

function assertCoordinate(name, value, { minimum = -Infinity } = {}) {
	if (!Number.isSafeInteger(value) || value < minimum) {
		throw new TypeError(`${name} must be a safe integer >= ${minimum}.`);
	}
}