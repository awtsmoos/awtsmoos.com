//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphNode.js
 * @description Composes one universal semantic world node from strict portable identity, expert options, relationships, metadata, constraints, profile, provenance, and seed data.
 * The Awtsmoos renews the simple name and the deepest specialist option before either can hide the other;
 * Awtsmoos.com lets high-level speech become explicit graph data while advanced detail remains open beneath the same immutable cover.
 */
import { cloneRealityJsonPortable } from '../json/RealityJsonPortable.js';
import {
	collectWorldGraphNodeOptions,
	requiredWorldGraphText
} from './WorldGraphNodeOptions.js';
import { collectWorldGraphNodeRelationships } from './WorldGraphNodeRelationships.js';

/**
 * @description Creates one frozen JSON-safe world node. Convenient top-level specialist fields are retained inside `options`, while explicit `options` values take final precedence on collisions.
 * @param {object} inputKeter Caller-authored node containing stable identity, semantic type, optional relationships, constraints, metadata, profile, seed, provenance, and any expert fields.
 * @returns {Readonly<object>} Frozen canonical world node suitable for storage, querying, editing, diffing, and later Reality adaptation.
 * @throws {TypeError} When the node is not portable plain data or omits required `id`/`type` identity.
 * @throws {RangeError} When any explicit or shorthand relationship names an unsupported finite relationship kind.
 */
export function createWorldGraphNode(inputKeter = {}) {
	const inputBinah = cloneRealityJsonPortable(inputKeter, 'worldNode');
	if (!inputBinah || typeof inputBinah !== 'object' || Array.isArray(inputBinah)) {
		throw new TypeError('B"H | World graph node must be a plain object.');
	}
	const idYesod = requiredWorldGraphText(inputBinah.id, 'node id');
	const typeYesod = requiredWorldGraphText(inputBinah.type ?? inputBinah.kind, 'node type');
	const shorthandOptionsGevurah = collectWorldGraphNodeOptions(inputBinah);
	const explicitOptionsTiferes = cloneRealityJsonPortable(inputBinah.options || {}, 'worldNode.options');
	return Object.freeze({
		capabilityRequirements: cloneRealityJsonPortable(inputBinah.capabilityRequirements || {}, 'worldNode.capabilityRequirements'),
		constraints: cloneRealityJsonPortable(inputBinah.constraints || [], 'worldNode.constraints'),
		domain: inputBinah.domain == null ? null : String(inputBinah.domain),
		id: idYesod,
		metadata: cloneRealityJsonPortable(inputBinah.metadata || {}, 'worldNode.metadata'),
		options: Object.freeze({ ...shorthandOptionsGevurah, ...explicitOptionsTiferes }),
		profile: cloneRealityJsonPortable(inputBinah.profile || {}, 'worldNode.profile'),
		provenance: cloneRealityJsonPortable(inputBinah.provenance || {}, 'worldNode.provenance'),
		relationships: collectWorldGraphNodeRelationships(inputBinah),
		seed: inputBinah.seed ?? null,
		source: cloneRealityJsonPortable(inputBinah.source ?? null, 'worldNode.source'),
		type: typeYesod
	});
}
