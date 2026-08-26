// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherAttachment.js
 * @description Places one feather or a quality-bounded row of feathers on any semantic creature anchor.
 * RESPONSIBILITY: derive feather roots and directions from an arbitrary local attachment frame while reusing the canonical feather primitive.
 * NON-RESPONSIBILITY: this module does not compile feather geometry, animate flutter, or choose species defaults.
 * The Awtsmoos reveals lightness at wing, tail, head, limb, or horn alike; Awtsmoos.com lets one feather covenant multiply in ordered rows without severing each vane from its source.
 */

import { createFeatherComponent } from './FeatherComponent.js';
import { creatureMirrorPair } from './CreatureMirrorIds.js';
import { resolveCreatureAttachmentAnchor } from './CreatureAttachmentAnchor.js';
import {
	addAttachmentVectors,
	createAttachmentBasis,
	normalizeAttachmentVector,
	scaleAttachmentVector
} from './AttachmentVector.js';

/**
 * Creates arbitrary single or row-distributed feather attachments.
 * @param {object} guides Existing anatomy/component guide map.
 * @param {object} descriptor Target, count, spread, spacing, dimensions, id, and mirror intent.
 * @param {object} quality Creature quality budget that caps feather multiplicity.
 * @returns {object} Component additions compatible with CreatureComponentProfile.
 */
export function createFeatherAttachment(guides, descriptor, quality) {
	const anchor = resolveCreatureAttachmentAnchor(guides, descriptor);
	if (!anchor || !quality) {
		return empty();
	}
	const result = empty();
	const basis = createAttachmentBasis(anchor.direction);
	const count = featherCount(descriptor.count, quality.featherCount);
	for (let index = 0; index < count; index += 1) {
		appendFeather(result, anchor, basis, descriptor, quality, index, count);
	}
	result.surfaceRoles.push('feather');
	return result;
}

/** Creates one feather in a row while preserving mirror lineage for both shaft and vane. */
function appendFeather(result, anchor, basis, descriptor, quality, index, count) {
	const centered = index - (count - 1) / 2;
	const normalized = count > 1 ? centered / (count - 1) : 0;
	const spacing = finiteNumber(descriptor.spacing, 0.06);
	const spread = finiteNumber(descriptor.spread, 0.45);
	const root = addAttachmentVectors(
		anchor.point,
		scaleAttachmentVector(basis.side, centered * spacing)
	);
	const direction = normalizeAttachmentVector(addAttachmentVectors(
		basis.tangent,
		scaleAttachmentVector(basis.side, normalized * spread)
	));
	const id = count === 1
		? descriptor.id || 'custom_feather'
		: `${descriptor.id || 'custom_feather'}_${index + 1}`;
	const feather = createFeatherComponent(
		id,
		root,
		direction,
		finitePositive(descriptor.length, 0.42),
		finitePositive(descriptor.width, 0.1),
		quality
	);
	Object.assign(result.guides, feather.guides);
	if (descriptor.mirror) {
		for (const guideId of Object.keys(feather.guides)) {
			result.symmetryPairs.push(creatureMirrorPair(guideId, descriptor.plane || 'X'));
		}
	}
}

/** Bounds requested row density against the real pre-allocation quality budget. */
function featherCount(requested, budget) {
	const maximum = Math.max(1, Math.floor(Number(budget) || 12));
	const count = Math.max(1, Math.floor(Number(requested) || 1));
	return Math.min(count, maximum);
}

/** Returns a finite number or fallback. */
function finiteNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Returns a positive finite number or fallback. */
function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns the empty component addition contract. */
function empty() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
