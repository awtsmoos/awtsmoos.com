// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MembraneAttachment.js
 * @description Spans any ordered set of semantic or explicit creature anchors with a renderer-neutral membrane.
 * RESPONSIBILITY: resolve arbitrary anchor sets for webbed hands, feet, fins, wings, frills, and future thin tissues.
 * NON-RESPONSIBILITY: this module does not create digits, solve cloth physics, or compile membrane triangles.
 * The Awtsmoos joins separated points without erasing their distinction; Awtsmoos.com lets one membrane law become web, fin, wing, or living veil wherever anchors gather.
 */

import { componentMembraneGuide } from './ComponentGuideFactory.js';
import { creatureMirrorPair } from './CreatureMirrorIds.js';
import { resolveCreatureAttachmentAnchor } from './CreatureAttachmentAnchor.js';

/**
 * Creates one arbitrary membrane from ordered guide anchors or literal points.
 * @param {object} guides Existing anatomy/component guide map.
 * @param {object} descriptor Id, anchors, material, role, sidedness, and mirror intent.
 * @returns {object} Component additions compatible with CreatureComponentProfile.
 */
export function createMembraneAttachment(guides, descriptor = {}) {
	const points = resolvePoints(guides, descriptor.anchors);
	if (points.length < 3) {
		return empty();
	}
	const id = descriptor.id || 'custom_membrane';
	const role = descriptor.surfaceRole || descriptor.role || 'webbing';
	const materialId = descriptor.materialId || `${role}_surface`;
	return {
		guides: {
			[id]: componentMembraneGuide(
				points,
				materialId,
				descriptor.doubleSided !== false
			)
		},
		surfaceRoles: [role],
		symmetryPairs: descriptor.mirror
			? [creatureMirrorPair(id, descriptor.plane || 'X')]
			: []
	};
}

/** Resolves ordered anchor descriptors while rejecting missing guide references. */
function resolvePoints(guides, anchors) {
	if (!Array.isArray(anchors)) {
		return [];
	}
	return anchors.map(anchor => {
		const descriptor = Array.isArray(anchor)
			? { point: anchor }
			: anchor;
		return resolveCreatureAttachmentAnchor(guides, descriptor);
	}).filter(Boolean).map(anchor => {
		return anchor.point;
	});
}

/** Returns the empty component addition contract. */
function empty() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
