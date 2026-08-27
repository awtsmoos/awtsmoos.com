// B"H
// Boruch Hashem
// Blessed is He
/**
 * Gevurah gives generative abundance its lawful boundary. The Awtsmoos is not
 * hidden by a vague error: Awtsmoos.com returns exact paths, codes, warnings,
 * budgets, and stable-reference consequences for every anatomical fault.
 */

function diagnostic(code, message, path = [], severity = "error", metadata = {}) {
	return Object.freeze({ code, message, path: Object.freeze(path), severity, metadata: Object.freeze(metadata) });
}

function duplicateIds(collection, path, diagnostics) {
	const seen = new Set();
	for (const item of collection) {
		if (!item?.id || seen.has(item.id)) diagnostics.push(diagnostic("CREATURE.DUPLICATE_ID", "Every anatomical element requires a unique stable ID.", path, "error", { id: item?.id || null }));
		seen.add(item?.id);
	}
}

/** Validates Briah anatomy without mutating or compiling geometry. */
export function validateBriahCreature(creature, options = {}) {
	const diagnostics = [];
	if (creature?.type !== "briah-creature") diagnostics.push(diagnostic("CREATURE.TYPE_INVALID", "Expected a Briah creature document.", ["type"]));
	if (!Array.isArray(creature?.body?.sections) || creature.body.sections.length < 2) diagnostics.push(diagnostic("CREATURE.AXIS_TOO_SHORT", "The primary axial graph requires at least two sections.", ["body", "sections"]));
	for (const [index, section] of (creature?.body?.sections || []).entries()) {
		if (section.ellipticalRadius?.some((value) => !Number.isFinite(value) || value <= 0)) diagnostics.push(diagnostic("CREATURE.RADIUS_INVALID", "Section radii must be finite and positive.", ["body", "sections", index, "ellipticalRadius"]));
	}
	for (const [limbIndex, limb] of (creature?.limbs || []).entries()) {
		if (!limb.segments?.length) diagnostics.push(diagnostic("CREATURE.LIMB_EMPTY", "A limb chain requires at least one segment.", ["limbs", limbIndex, "segments"]));
		for (const [segmentIndex, segment] of (limb.segments || []).entries()) {
			if (!Number.isFinite(segment.length) || segment.length <= 0) diagnostics.push(diagnostic("CREATURE.SEGMENT_LENGTH_INVALID", "Limb segment length must be positive.", ["limbs", limbIndex, "segments", segmentIndex, "length"]));
		}
	}
	duplicateIds(creature?.body?.sections || [], ["body", "sections"], diagnostics);
	duplicateIds(creature?.limbs || [], ["limbs"], diagnostics);
	duplicateIds(creature?.parts || [], ["parts"], diagnostics);
	const limits = options.limits || {};
	if (Number.isFinite(limits.maximumParts) && creature.parts.length > limits.maximumParts) diagnostics.push(diagnostic("CREATURE.BUDGET_PARTS", "Part count exceeds the declared budget.", ["parts"]));
	return Object.freeze({
		ok: diagnostics.every((entry) => entry.severity !== "error"),
		diagnostics: Object.freeze(diagnostics),
		summary: Object.freeze({ sections: creature?.body?.sections?.length || 0, limbs: creature?.limbs?.length || 0, parts: creature?.parts?.length || 0 })
	});
}
