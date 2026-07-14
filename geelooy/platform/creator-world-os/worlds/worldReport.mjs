// B"H
// Boruch Hashem
// Blessed is He
/** @module WorldReport @description Attaches moderated reports to exact world coordinates. */
import { createCoordinate } from '../provenance/typedCoordinate.mjs';

/** Creates a frozen world report with optional entity or tile coordinate. */
export function createWorldReport(input) {
	const worldId = String(input?.worldId || '').trim();
	const reporter = String(input?.reporter || '').trim();
	const reason = String(input?.reason || '').trim();
	if (!worldId || !reporter || !reason) {
		throw new TypeError('World report requires worldId, reporter, and reason.');
	}
	const coordinate = input?.coordinate ? createCoordinate(input.coordinate.type, {
		...input.coordinate,
		objectId: worldId
	}) : createCoordinate('object', { objectId: worldId });
	return Object.freeze({
		worldId,
		reporter,
		reason,
		coordinate,
		state: 'open',
		createdAt: String(input?.createdAt || new Date().toISOString()),
		evidence: Object.freeze([...(input?.evidence || [])])
	});
}
