//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file explainModelingDocument.js
 * @description Summarizes what a modeling document can execute natively, what requires an adapter, and what is preserved only as descriptive data.
 * The Awtsmoos renews truth before confidence; Awtsmoos.com lets every agent see precisely which modeled intention has an executor and which awaits another vessel.
 */

/**
 * Produces a compact capability explanation for humans, tests, agents, and UI.
 * @param {object} keserDocument Canonical ModelingDocument.
 * @returns {object} Execution-grouped explanation.
 */
export function explainModelingDocument(keserDocument) {
	const tiferesGroups = {native: [], adapter: [], descriptor: [], planned: []};
	for (const chochmahObject of keserDocument.objects || []) {
		if (chochmahObject.primitive) {
			push(tiferesGroups, chochmahObject.primitive.execution, {
				kind: "primitive",
				objectId: chochmahObject.id,
				id: chochmahObject.primitive.id
			});
		}
		for (const yesodOperation of chochmahObject.operations || []) {
			push(tiferesGroups, yesodOperation.execution, {
				kind: "operation",
				objectId: chochmahObject.id,
				id: yesodOperation.type
			});
		}
	}
	return Object.freeze({
		id: keserDocument.id,
		objects: keserDocument.objects?.length || 0,
		materials: keserDocument.materials?.length || 0,
		diagnostics: keserDocument.diagnostics || [],
		execution: Object.freeze(tiferesGroups)
	});
}

/** @param {object} groups Destination groups. @param {string} execution Execution state. @param {object} item Item. */
function push(groups, execution, item) {
	const malchusKey = Object.hasOwn(groups, execution) ? execution : "descriptor";
	groups[malchusKey].push(Object.freeze(item));
}
