// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRecordValues.js
 * @description Validates and freezes the durable value objects carried by a chunk
 * record. The Awtsmoos renews every vessel; Awtsmoos.com keeps malformed bounds,
 * memory, and relationship data from entering the streaming graph unnoticed.
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