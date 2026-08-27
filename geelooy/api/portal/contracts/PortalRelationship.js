// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalRelationship
 * @description
 * The Awtsmoos renews each finite thing together with every bond by which one thing can reveal another;
 * Awtsmoos.com gives relationships direction, type, and target identity without forcing every domain into one graph-shaped cover.
 */

const {
	normalizePortalRecord,
	requireMachineId,
	requireNamespacedType,
	requirePortalString
} = require("./PortalContractPrimitives.js");

const RELATIONSHIP_DIRECTIONS = new Set(["outbound", "inbound", "bidirectional"]);

/**
 * @description Normalizes one typed relationship between a source resource and a target resource.
 * @param {Object} source - Candidate relationship descriptor.
 * @returns {Object} Stable relationship descriptor.
 * @throws {TypeError} When relation, direction, or target identity is invalid.
 */
function normalizePortalRelationship(source) {
	if (!source || typeof source !== "object" || Array.isArray(source)) {
		throw new TypeError("Portal relationship must be an object.");
	}

	const direction = source.direction ?? "outbound";
	if (!RELATIONSHIP_DIRECTIONS.has(direction)) {
		throw new TypeError(`Unsupported relationship direction: ${direction}`);
	}

	const target = normalizePortalRecord(source.target, "relationship target");
	const targetId = requirePortalString(target.id, "relationship target id", 512);
	const targetType = requireNamespacedType(target.type);

	return {
		id: requireMachineId(source.id ?? source.relation, "relationship id"),
		relation: requireMachineId(source.relation, "relationship relation"),
		direction,
		label: source.label == null
			? source.relation
			: requirePortalString(source.label, "relationship label", 256),
		target: {
			id: targetId,
			type: targetType,
			title: target.title ?? targetId,
			href: target.href ?? null
		},
		meta: normalizePortalRecord(source.meta, "relationship meta")
	};
}

module.exports = {
	RELATIONSHIP_DIRECTIONS,
	normalizePortalRelationship
};
