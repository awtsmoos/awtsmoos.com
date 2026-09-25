// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRecordValues.js
 * @description Validates and freezes the durable value objects carried by a chunk
 * record. The Awtsmoos renews every vessel; Awtsmoos.com keeps malformed bounds,
 * memory, relationship, and mutation data from entering the streaming graph unnoticed.
 */
export function freezeChunkBounds(bounds = {}) {
	const minimum = freezeVector(bounds.min);
	const maximum = freezeVector(bounds.max);
	for (const axis of ['x', 'y', 'z']) {
		if (maximum[axis] < minimum[axis]) {
			throw new TypeError(`Chunk bounds max.${axis} must be >= min.${axis}.`);
		}
	}
	return Object.freeze({ min: minimum, max: maximum });
}

export function freezeChunkStrings(values = []) {
	if (!Array.isArray(values) || values.some((value) => typeof value !== 'string')) {
		throw new TypeError('Chunk relationship lists must contain only strings.');
	}
	return Object.freeze([...values]);
}

export function freezeChunkMemory(value = {}) {
	return Object.freeze({
		geometry: nonnegativeChunkNumber('memory.geometry', value.geometry),
		textures: nonnegativeChunkNumber('memory.textures', value.textures),
		collision: nonnegativeChunkNumber('memory.collision', value.collision)
	});
}

export function freezeChunkReadiness(value = {}) {
	return Object.freeze({
		visualReady: value.visualReady === true,
		collisionPrepared: value.collisionPrepared === true,
		safetyValidated: value.safetyValidated === true
	});
}

export function freezeCollisionHandoff(value = {}) {
	return Object.freeze({
		parentRetained: value.parentRetained === true,
		atomicReady: value.atomicReady === true
	});
}

/** Freezes one JSON-safe gameplay mutation map so unload/reload can carry world state. */
export function freezeChunkMutations(value = {}) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new TypeError('Chunk durable mutations must be a plain object.');
	}
	const frozen = {};
	for (const [key, entry] of Object.entries(value)) {
		frozen[key] = freezeMutationValue(`mutations.${key}`, entry);
	}
	return Object.freeze(frozen);
}

export function nonnegativeChunkInteger(name, value, minimum = 0) {
	if (!Number.isSafeInteger(value) || value < minimum) {
		throw new TypeError(`${name} must be an integer >= ${minimum}.`);
	}
	return value;
}

export function nonnegativeChunkNumber(name, value = 0) {
	const number = finiteNumber(name, value);
	if (number < 0) {
		throw new TypeError(`${name} must be nonnegative.`);
	}
	return number;
}

export function clampChunkUnit(value = 0) {
	return Math.min(1, Math.max(0, Number(value) || 0));
}

/** Freezes one JSON-safe mutation value, rejecting anything serialization cannot carry. */
function freezeMutationValue(name, entry) {
	if (entry === null) return null;
	const type = typeof entry;
	if (type === 'string' || type === 'boolean') return entry;
	if (type === 'number') {
		if (!Number.isFinite(entry)) {
			throw new TypeError(`${name} must be finite.`);
		}
		return entry;
	}
	if (Array.isArray(entry)) {
		return Object.freeze(entry.map((item, index) => freezeMutationValue(`${name}[${index}]`, item)));
	}
	if (type === 'object') {
		const frozen = {};
		for (const [key, nested] of Object.entries(entry)) {
			frozen[key] = freezeMutationValue(`${name}.${key}`, nested);
		}
		return Object.freeze(frozen);
	}
	throw new TypeError(`${name} must be JSON-safe (no functions, undefined, or symbols).`);
}

function freezeVector(value = {}) {
	return Object.freeze({
		x: finiteNumber('vector.x', value.x),
		y: finiteNumber('vector.y', value.y),
		z: finiteNumber('vector.z', value.z)
	});
}

function finiteNumber(name, value = 0) {
	if (!Number.isFinite(value)) {
		throw new TypeError(`${name} must be finite.`);
	}
	return value;
}
