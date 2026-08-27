//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWorldGraphAdapter.js
 * @description Adapts portable semantic world nodes into the existing Reality intent language while preserving every expert option and reporting richer relation semantics that current intent planning cannot yet realize.
 * The Awtsmoos renews the boundless relation before a finite planner can support only part of its revealed meaning;
 * Awtsmoos.com lets the adapter translate what is real today, preserve what is deeper for tomorrow, and never counterfeit behavior merely because a high-level graph can name it.
 */
import { cloneRealityJsonPortable } from './json/RealityJsonPortable.js';
import { normalizeWorldGraphDocument } from './worldGraph/WorldGraphDocument.js';

const SUPPORTED_RELATIONSHIPS = Object.freeze([
	'around',
	'near',
	'on'
]);

/**
 * @description Converts one canonical or graph-like World Graph document into ordinary Reality intents plus explicit supported/unsupported relationship evidence.
 * @param {object} graphKeter Portable World Graph document whose nodes may contain open expert options and the full semantic relationship vocabulary.
 * @returns {Readonly<object>} Frozen adapter report containing canonical graph, Reality intents, translated relation evidence, and unsupported relation evidence.
 * @throws {TypeError|RangeError} When graph data fails canonical World Graph validation or expert option data is not portable.
 */
export function adaptWorldGraphToRealityIntents(graphKeter) {
	const graphBinah = normalizeWorldGraphDocument(graphKeter);
	const supportedNetzach = [];
	const unsupportedHod = [];
	const intentsOros = graphBinah.nodes.map((nodeKli) => {
		return adaptWorldGraphNode(nodeKli, supportedNetzach, unsupportedHod);
	});
	return Object.freeze({
		graph: graphBinah,
		intents: Object.freeze(intentsOros),
		supportedRelationships: Object.freeze(supportedNetzach),
		unsupportedRelationships: Object.freeze(unsupportedHod)
	});
}

/**
 * @description Returns the exact relation kinds currently translatable into canonical Reality intent references; richer graph relations remain preserved but unsupported.
 * @returns {ReadonlyArray<string>} Frozen relation-kind list containing `around`, `near`, and `on`.
 */
export function realityWorldGraphSupportedRelationships() {
	return SUPPORTED_RELATIONSHIPS;
}

/**
 * @description Builds one ordinary Reality intent while keeping explicit expert options authoritative over graph profile and seed convenience values.
 * @param {object} nodeKli Canonical World Graph node.
 * @param {object[]} supportedNetzach Mutable local accumulator receiving portable evidence for translated relationships.
 * @param {object[]} unsupportedHod Mutable local accumulator receiving portable evidence for preserved but unrealized relationships.
 * @returns {Readonly<object>} Frozen strict-portable Reality intent record suitable for the existing canonical planner.
 */
function adaptWorldGraphNode(nodeKli, supportedNetzach, unsupportedHod) {
	const referencesYesod = collectRealityReferences(nodeKli, supportedNetzach, unsupportedHod);
	const optionsTiferes = createNodeIntentOptions(nodeKli);
	return cloneRealityJsonPortable({
		id: nodeKli.id,
		options: optionsTiferes,
		type: nodeKli.type,
		...referencesYesod
	}, `worldGraph.intent.${nodeKli.id}`);
}

/**
 * @description Preserves the complete expert option payload while graph-level profile/seed convenience values fill only still-missing specialist keys.
 * @param {object} nodeKli Canonical World Graph node containing expert `options`, profile overrides, and optional seed.
 * @returns {Readonly<object>} Frozen portable intent-options object with explicit expert options retaining final precedence.
 */
function createNodeIntentOptions(nodeKli) {
	return cloneRealityJsonPortable({
		...nodeKli.profile,
		...(nodeKli.seed == null ? {} : { seed: nodeKli.seed }),
		...nodeKli.options
	}, `worldGraph.intentOptions.${nodeKli.id}`);
}

/**
 * @description Groups supported relation targets into canonical Reality reference fields and records every unsupported relation without discarding its target or expert edge options.
 * @param {object} nodeKli Canonical World Graph node whose relationships are inspected.
 * @param {object[]} supportedNetzach Mutable local supported-evidence accumulator owned by the adapter call.
 * @param {object[]} unsupportedHod Mutable local unsupported-evidence accumulator owned by the adapter call.
 * @returns {Readonly<object>} Frozen portable reference-field object keyed only by currently supported Reality relation names.
 */
function collectRealityReferences(nodeKli, supportedNetzach, unsupportedHod) {
	const groupedYesod = {};
	for (const relationshipKli of nodeKli.relationships) {
		const evidenceHod = createRelationshipEvidence(nodeKli.id, relationshipKli);
		if (!SUPPORTED_RELATIONSHIPS.includes(relationshipKli.kind)) {
			unsupportedHod.push(Object.freeze({
				...evidenceHod,
				reason: 'relationship-not-yet-realized-by-reality-intent-planner'
			}));
			continue;
		}
		(groupedYesod[relationshipKli.kind] ||= []).push(relationshipKli.target);
		supportedNetzach.push(evidenceHod);
	}
	return Object.freeze(Object.fromEntries(Object.entries(groupedYesod).map(([kindYesod, targetsOros]) => {
		return [kindYesod, targetsOros.length === 1 ? targetsOros[0] : Object.freeze(targetsOros)];
	})));
}

/**
 * @description Creates portable relationship evidence preserving node identity, semantic kind, target, external status, and expert edge options for explainability.
 * @param {string} nodeIdYesod Stable source node ID.
 * @param {object} relationshipKli Canonical relationship record.
 * @returns {Readonly<object>} Frozen strict-portable evidence record.
 */
function createRelationshipEvidence(nodeIdYesod, relationshipKli) {
	return cloneRealityJsonPortable({
		external: relationshipKli.external,
		kind: relationshipKli.kind,
		nodeId: nodeIdYesod,
		options: relationshipKli.options,
		target: relationshipKli.target
	}, `worldGraph.relationshipEvidence.${nodeIdYesod}`);
}
