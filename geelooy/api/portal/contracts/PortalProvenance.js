// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalProvenance
 * @description
 * The Awtsmoos renews every result while honest software still remembers through which finite vessel it appeared;
 * Awtsmoos.com records authored, imported, generated, transformed, synchronized, cloned, and derived origins without turning inference into fact revered.
 */

const {
	normalizePortalRecord,
	requireMachineId,
	requirePortalString
} = require("./PortalContractPrimitives.js");

const PROVENANCE_KINDS = new Set([
	"user",
	"imported",
	"generated",
	"transformed",
	"synchronized",
	"cloned",
	"derived",
	"system"
]);
const VERIFICATION_STATES = new Set(["authored", "verified", "inferred", "unverified"]);

/**
 * @description Normalizes one resource provenance descriptor with explicit source and verification semantics.
 * @param {Object} source - Candidate provenance metadata.
 * @returns {Object} Stable provenance descriptor.
 * @throws {TypeError} When source kind or verification state is unsupported.
 */
function normalizePortalProvenance(source) {
	const provenance = normalizePortalRecord(source, "provenance");
	const kind = provenance.kind ?? "system";
	const verification = provenance.verification ?? "unverified";

	if (!PROVENANCE_KINDS.has(kind)) {
		throw new TypeError(`Unsupported provenance kind: ${kind}`);
	}
	if (!VERIFICATION_STATES.has(verification)) {
		throw new TypeError(`Unsupported provenance verification: ${verification}`);
	}

	return {
		kind,
		verification,
		sourceId: provenance.sourceId == null
			? null
			: requirePortalString(provenance.sourceId, "provenance source id", 512),
		sourceType: provenance.sourceType ?? null,
		references: Array.isArray(provenance.references) ? provenance.references.slice(0, 64) : [],
		transformerId: provenance.transformerId == null
			? null
			: requireMachineId(provenance.transformerId, "provenance transformer id"),
		transformerVersion: provenance.transformerVersion ?? null,
		deterministic: provenance.deterministic === true,
		confidence: Number.isFinite(Number(provenance.confidence))
			? Math.max(0, Math.min(1, Number(provenance.confidence)))
			: null,
		meta: normalizePortalRecord(provenance.meta, "provenance meta")
	};
}

module.exports = {
	PROVENANCE_KINDS,
	VERIFICATION_STATES,
	normalizePortalProvenance
};
