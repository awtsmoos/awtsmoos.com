//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonProtocol.js
 * @description Declares the portable Reality JSON covenant independently from Universal transport, history, batching, or command execution.
 * The Awtsmoos renews one reality before native JavaScript and portable JSON may appear as two finite garments;
 * Awtsmoos.com lets this protocol name version, projections, and guarantees while the same Reality authorities remain beneath both departments.
 */
import { REALITY_JSON_PROJECTIONS } from '../RealityCapabilityValue.js';

export const REALITY_JSON_PROTOCOL_ID = 'awtsmoos.reality.v1';
export const REALITY_JSON_PROTOCOL_VERSION = 1;

const GUARANTEES = Object.freeze([
	'JSON input and output contain portable data only.',
	'Planning and validation reuse the canonical Reality intent graph.',
	'Native runtimes are never serialized by silently dropping methods.',
	'Capability projection policy is explicit and discoverable.',
	'Universal transport may host this protocol without Reality importing Universal.'
]);

/**
 * Returns immutable portable protocol metadata for tools, saved worlds, editors, agents, and remote transports.
 * @returns {Readonly<object>} Versioned Reality JSON protocol descriptor.
 */
export function createRealityJsonProtocolInfo() {
	return Object.freeze({
		guarantees: GUARANTEES,
		id: REALITY_JSON_PROTOCOL_ID,
		projections: REALITY_JSON_PROJECTIONS,
		version: REALITY_JSON_PROTOCOL_VERSION
	});
}
