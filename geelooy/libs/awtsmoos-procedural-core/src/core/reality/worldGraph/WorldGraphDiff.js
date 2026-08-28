//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphDiff.js
 * @description Produces portable semantic differences between immutable world documents by stable node identity rather than JavaScript reference identity.
 * The Awtsmoos renews both worlds before added, removed, unchanged, or altered can appear between them;
 * Awtsmoos.com lets editors see exactly which options, profiles, metadata, relations, and document laws moved without pretending runtime recompilation already came.
 */
import { normalizeWorldGraphDocument } from './WorldGraphDocument.js';
import { worldGraphPortableEqual } from './WorldGraphEquality.js';

const NODE_FIELDS = Object.freeze([
	'capabilityRequirements',
	'constraints',
	'domain',
	'metadata',
	'options',
	'profile',
	'provenance',
	'relationships',
	'seed',
	'source',
	'type'
]);

/**
 * @description Compares two graph documents and reports stable semantic changes without realizing either world or mutating either document.
 * @param {object} beforeKeter Earlier canonical or graph-like world document.
 * @param {object} afterKeter Later canonical or graph-like world document.
 * @returns {Readonly<object>} Frozen portable diff containing added/removed/unchanged ids, node change records, and changed document-level fields.
 * @throws {TypeError|RangeError} When either graph fails canonical world-document validation.
 */
export function diffWorldGraphs(beforeKeter, afterKeter) {
	const beforeBinah = normalizeWorldGraphDocument(beforeKeter);
	const afterBinah = normalizeWorldGraphDocument(afterKeter);
	const beforeByIdYesod = indexNodes(beforeBinah.nodes);
	const afterByIdYesod = indexNodes(afterBinah.nodes);
	const addedNetzach = afterBinah.nodes.filter((nodeKli) => !beforeByIdYesod[nodeKli.id]).map((nodeKli) => nodeKli.id);
	const removedGevurah = beforeBinah.nodes.filter((nodeKli) => !afterByIdYesod[nodeKli.id]).map((nodeKli) => nodeKli.id);
	const changedTiferes = [];
	const unchangedChesed = [];
	for (const afterNodeKli of afterBinah.nodes) {
		const beforeNodeKli = beforeByIdYesod[afterNodeKli.id];
		if (!beforeNodeKli) continue;
		const changeBinah = createNodeChange(beforeNodeKli, afterNodeKli);
		if (changeBinah) changedTiferes.push(changeBinah);
		else unchangedChesed.push(afterNodeKli.id);
	}
	return Object.freeze({
		added: Object.freeze(addedNetzach),
		changed: Object.freeze(changedTiferes),
		documentFields: changedDocumentFields(beforeBinah, afterBinah),
		removed: Object.freeze(removedGevurah),
		unchanged: Object.freeze(unchangedChesed)
	});
}

/**
 * @description Builds a stable-id lookup for one already validated authored node array.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @returns {Readonly<Record<string, object>>} Frozen lookup keyed by stable node id.
 */
function indexNodes(nodesOros) {
	return Object.freeze(Object.fromEntries(nodesOros.map((nodeKli) => [nodeKli.id, nodeKli])));
}

/**
 * @description Creates one semantic node-change summary, including deep option/profile/metadata key changes and relationship evidence.
 * @param {object} beforeNodeKli Earlier canonical node.
 * @param {object} afterNodeKli Later canonical node with the same stable id.
 * @returns {Readonly<object>|null} Frozen change summary, or null when the nodes are semantically equal.
 */
function createNodeChange(beforeNodeKli, afterNodeKli) {
	const fieldsOros = NODE_FIELDS.filter((fieldBinah) => {
		return !worldGraphPortableEqual(beforeNodeKli[fieldBinah], afterNodeKli[fieldBinah]);
	});
	if (fieldsOros.length === 0) return null;
	return Object.freeze({
		fields: Object.freeze(fieldsOros),
		id: afterNodeKli.id,
		metadataKeys: changedKeys(beforeNodeKli.metadata, afterNodeKli.metadata),
		optionKeys: changedKeys(beforeNodeKli.options, afterNodeKli.options),
		profileKeys: changedKeys(beforeNodeKli.profile, afterNodeKli.profile),
		relationshipsChanged: fieldsOros.includes('relationships')
	});
}

/**
 * @description Reports portable object keys whose presence or value differs between two plain records.
 * @param {object} beforeKli Earlier portable object.
 * @param {object} afterKli Later portable object.
 * @returns {ReadonlyArray<string>} Sorted frozen changed-key list.
 */
function changedKeys(beforeKli = {}, afterKli = {}) {
	const keysNetzach = new Set([...Object.keys(beforeKli), ...Object.keys(afterKli)]);
	return Object.freeze([...keysNetzach]
		.filter((keyBinah) => !worldGraphPortableEqual(beforeKli[keyBinah], afterKli[keyBinah]))
		.sort());
}

/**
 * @description Reports document-level fields whose portable values changed independently of node changes.
 * @param {object} beforeBinah Earlier canonical world document.
 * @param {object} afterBinah Later canonical world document.
 * @returns {ReadonlyArray<string>} Frozen changed document-field names.
 */
function changedDocumentFields(beforeBinah, afterBinah) {
	const fieldsOros = ['capabilityRequirements', 'defaults', 'metadata', 'provenance', 'rootSeed'];
	return Object.freeze(fieldsOros.filter((fieldBinah) => {
		return !worldGraphPortableEqual(beforeBinah[fieldBinah], afterBinah[fieldBinah]);
	}));
}
