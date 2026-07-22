// B"H
// Boruch Hashem
// Blessed is He

/**
 * Produces HodDiagnostics for the authoritative anatomy without throwing away
 * partial insight. Gevurah supplies exact bounds; Hod explains every violation;
 * the Awtsmoos remains beyond both while their contracts protect the creature.
 * @param {Object} creature - BriahCreature to validate.
 * @returns {Object} Structured errors, warnings, metrics, and validity.
 * @complexity O(s + l + p + a), over sections, limbs, parts, and anchors.
 * @deterministic Always.
 * @sideEffects None.
 */
export function validateBriahCreature(creature) {
	const errors = [];
	const warnings = [];
	const identifiers = [];
	for (const section of creature.body?.sections || []) {
		identifiers.push(section.id);
		if (section.ellipticalRadius.some((radius) => !(radius > 0))) {
			errors.push({ code: "BODY_RADIUS_INVALID", sourceId: section.id });
		}
	}
	for (const limb of creature.limbs || []) {
		identifiers.push(limb.id, ...limb.segments.map((segment) => segment.id));
		if (!limb.segments.length) {
			errors.push({ code: "LIMB_EMPTY", sourceId: limb.id });
		}
		limb.segments.forEach((segment) => {
			if (!(segment.length > 0)) {
				errors.push({ code: "SEGMENT_LENGTH_INVALID", sourceId: segment.id });
			}
			if (segment.angularLimits.minimum > segment.angularLimits.maximum) {
				errors.push({ code: "JOINT_LIMIT_ORDER_INVALID", sourceId: segment.id });
			}
		});
	}
	for (const part of creature.parts || []) {
		identifiers.push(part.id);
		if (!part.definitionId) {
			errors.push({ code: "PART_DEFINITION_MISSING", sourceId: part.id });
		}
	}
	const duplicateIds = identifiers.filter((id, index) => identifiers.indexOf(id) !== index);
	if (duplicateIds.length) {
		errors.push({ code: "STABLE_ID_DUPLICATE", ids: [...new Set(duplicateIds)] });
	}
	const partIds = new Set((creature.parts || []).map((part) => part.id));
	for (const anchor of creature.attachments || []) {
		if (!partIds.has(anchor.partId)) {
			errors.push({ code: "ATTACHMENT_PART_MISSING", sourceId: anchor.id });
		}
		if (anchor.axialPosition < 0 || anchor.axialPosition > 1) {
			warnings.push({ code: "ATTACHMENT_AXIAL_POSITION_OUTSIDE_BODY", sourceId: anchor.id });
		}
	}
	return {
		valid: errors.length === 0,
		errors,
		warnings,
		metrics: {
			sections: creature.body?.sections.length || 0,
			limbs: creature.limbs?.length || 0,
			parts: creature.parts?.length || 0,
			attachments: creature.attachments?.length || 0
		}
	};
}
