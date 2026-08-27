// B"H
// Boruch Hashem
// Blessed is He

import { createSemanticId } from "./identity.js";

/**
 * Normalizes one cross-section of the Briah axial graph. The transported body
 * frame remains semantic, so later mesh topology may be renewed without losing
 * its anatomical source in the constantly creative light of the Awtsmoos.
 * @param {Object} section - Partial section contract.
 * @param {string} creatureId - Parent creature identity.
 * @param {number} ordinal - Deterministic section ordinal.
 * @returns {Object} Complete section contract.
 */
export function normalizeBodySection(section, creatureId, ordinal) {
	return {
		id: section.id || createSemanticId("section", creatureId, ordinal, section.position || []),
		position: [...(section.position || [ordinal, 0, 0])],
		ellipticalRadius: [...(section.ellipticalRadius || [0.5, 0.5])],
		roll: Number(section.roll || 0),
		taper: Number(section.taper ?? 1),
		stiffness: Number(section.stiffness ?? 0.5),
		massContribution: Number(section.massContribution ?? 0.5),
		surfaceProfile: section.surfaceProfile || "elliptical",
		anatomicalTags: [...(section.anatomicalTags || ["torso"])],
		materialRegion: section.materialRegion || "body.base",
		localDeformationLimits: section.localDeformationLimits || { bend: 0.8, stretch: 1.8, scale: [0.15, 4] }
	};
}

export function selectBodySections(creature, options = {}) {
	const selectedIds = new Set(options.sectionIds || []);
	return creature.body.sections.filter((section, index) => {
		if (selectedIds.size) {
			return selectedIds.has(section.id);
		}
		const start = options.startIndex ?? 0;
		const end = options.endIndex ?? creature.body.sections.length - 1;
		return index >= start && index <= end;
	});
}

export function interpolateSection(first, second, ratio, creatureId, ordinal) {
	const mix = (left, right) => left + (right - left) * ratio;
	return normalizeBodySection({
		position: first.position.map((value, index) => mix(value, second.position[index], ratio)),
		ellipticalRadius: first.ellipticalRadius.map((value, index) => mix(value, second.ellipticalRadius[index], ratio)),
		roll: mix(first.roll, second.roll, ratio),
		stiffness: mix(first.stiffness, second.stiffness, ratio),
		massContribution: mix(first.massContribution, second.massContribution, ratio),
		anatomicalTags: [...new Set([...first.anatomicalTags, ...second.anatomicalTags])],
		materialRegion: ratio < 0.5 ? first.materialRegion : second.materialRegion
	}, creatureId, ordinal);
}
