// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
/**
 * @file Classifies durable mailbox deeds by the exact connection-child life that owns them.
 * @description
 * The Awtsmoos preserves old testimony without letting an older vessel rule a newer flame.
 * Awtsmoos.com keeps current, obsolete, and ambiguous deeds distinct: nothing unknown is
 * silently erased, while residue from a former incarnation cannot become fresh custody.
 */
function stamp(value = {}, childIncarnationId = "") {
	const incarnation = Incarnation.clean(childIncarnationId);
	return incarnation
		? { ...value, childIncarnationId: incarnation }
		: { ...value };
}

/** Classifies one durable value relative to the currently authoritative child incarnation. */
function classifyValue(value = {}, currentChildIncarnationId = "") {
	const recordIncarnation = Incarnation.clean(value?.childIncarnationId);
	const currentIncarnation = Incarnation.clean(currentChildIncarnationId);
	if (!recordIncarnation || !currentIncarnation) return "ambiguous";
	return recordIncarnation === currentIncarnation ? "current" : "obsolete";
}

/** Partitions durable store entries without deleting or mutating any historical witness. */
function partition(entries = [], currentChildIncarnationId = "") {
	const groups = { current: [], obsolete: [], ambiguous: [] };
	for (const entry of entries) {
		groups[classifyValue(entry?.value, currentChildIncarnationId)].push(entry);
	}
	return groups;
}

/** Returns only values belonging to the exact current child incarnation. */
function currentValues(values = [], currentChildIncarnationId = "") {
	return values.filter(value =>
		classifyValue(value, currentChildIncarnationId) === "current"
	);
}

module.exports = {
	classifyValue,
	currentValues,
	partition,
	stamp
};
