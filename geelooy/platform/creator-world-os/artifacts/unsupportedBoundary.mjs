// B"H
// Boruch Hashem
// Blessed is He
/** @module UnsupportedBoundary @description Records the exact point where capability truth ends. */
import { createTraceCoordinate } from './traceCoordinate.mjs';

/** Creates an immutable unsupported-capability boundary. */
export function createUnsupportedBoundary(input) {
	const capability = String(input?.capability || '').trim();
	const reason = String(input?.reason || '').trim();
	if (!capability || !reason) {
		throw new TypeError('Unsupported boundary requires capability and reason.');
	}
	return Object.freeze({
		capability,
		reason,
		coordinate: input?.coordinate ? createTraceCoordinate(input.coordinate) : null,
		recoverable: input?.recoverable === true,
		requiredWork: Object.freeze([...(input?.requiredWork || [])]),
		observedAt: String(input?.observedAt || new Date().toISOString())
	});
}
