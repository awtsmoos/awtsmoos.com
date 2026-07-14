// B"H
// Boruch Hashem
// Blessed is He
/** @module TraceCoordinate @description Targets exact instructions, methods, frames, imports, and logs. */

export const TRACE_KINDS = Object.freeze([
	'instruction',
	'method',
	'frame',
	'import',
	'resource',
	'log',
	'ui-node',
	'memory'
]);

/** Creates one artifact-trace coordinate. */
export function createTraceCoordinate(input) {
	const artifactId = String(input?.artifactId || '').trim();
	const kind = String(input?.kind || '').trim();
	if (!artifactId || !TRACE_KINDS.includes(kind)) {
		throw new TypeError('Trace coordinate requires artifactId and supported kind.');
	}
	return Object.freeze({
		artifactId,
		kind,
		address: input?.address ?? null,
		path: input?.path || null,
		index: input?.index ?? null,
		context: Object.freeze({ ...(input?.context || {}) })
	});
}
