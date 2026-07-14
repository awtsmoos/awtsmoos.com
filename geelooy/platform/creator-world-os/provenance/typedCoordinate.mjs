// B"H
// Boruch Hashem
// Blessed is He
/** @module TypedCoordinate @description Targets exact internal locations across media and worlds. */

export const COORDINATE_TYPES = Object.freeze([
	'object',
	'section',
	'subsection',
	'source-range',
	'frame',
	'clip',
	'entity',
	'tile',
	'instruction',
	'method',
	'replay-moment'
]);

/** Creates one validated typed coordinate. */
export function createCoordinate(type, data = {}) {
	if (!COORDINATE_TYPES.includes(type)) {
		throw new TypeError(`Unsupported coordinate type: ${type}`);
	}
	if (!data.objectId) {
		throw new TypeError('Coordinate objectId is required.');
	}
	validateSpecific(type, data);
	return Object.freeze({
		type,
		objectId: String(data.objectId),
		path: data.path || null,
		start: data.start ?? null,
		end: data.end ?? null,
		metadata: Object.freeze({ ...(data.metadata || {}) })
	});
}

function validateSpecific(type, data) {
	const temporal = ['frame', 'clip', 'replay-moment'];
	if (temporal.includes(type) && !Number.isFinite(Number(data.start))) {
		throw new TypeError(`${type} coordinate requires numeric start.`);
	}
	if (type === 'entity' && !String(data.path || '').trim()) {
		throw new TypeError('Entity coordinate requires a path or entity identifier.');
	}
}
