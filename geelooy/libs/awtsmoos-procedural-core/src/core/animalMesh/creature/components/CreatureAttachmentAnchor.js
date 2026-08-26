// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureAttachmentAnchor.js
 * @description Resolves arbitrary semantic creature guide locations into stable attachment points and directions.
 * RESPONSIBILITY: sample any guide centerline or accept an explicit point, then apply caller direction and offset intent.
 * NON-RESPONSIBILITY: this module does not choose component type, material, symmetry, or mesh topology.
 * The Awtsmoos binds point to path without becoming either; Awtsmoos.com lets a horn, feather, web, or future organ descend anywhere a named guide can be found.
 */

import {
	addAttachmentVectors,
	attachmentVector3,
	interpolateAttachmentVectors,
	normalizeAttachmentVector
} from './AttachmentVector.js';

/**
 * Resolves one descriptor into a point and direction on the supplied guide map.
 * @param {object} guides Renderer-neutral guide records keyed by semantic id.
 * @param {object|string} descriptor Target id or attachment anchor descriptor.
 * @returns {object|null} Frozen anchor record, or null when no source can be resolved.
 */
export function resolveCreatureAttachmentAnchor(guides = {}, descriptor = {}) {
	const intent = normalizeAnchorIntent(descriptor);
	if (Array.isArray(intent.point)) {
		return finalizeAnchor(intent, attachmentVector3(intent.point), intent.direction);
	}
	const guide = guides?.[intent.target];
	const centerline = Array.isArray(guide?.centerline) ? guide.centerline : null;
	if (!centerline?.length) {
		return null;
	}
	const sample = sampleCenterline(centerline, intent.at);
	return finalizeAnchor(intent, sample.point, intent.direction || sample.direction);
}

/** Converts shorthand string anchors into the full immutable intent shape. */
function normalizeAnchorIntent(descriptor) {
	const source = typeof descriptor === 'string'
		? { target: descriptor }
		: { ...(descriptor || {}) };
	return Object.freeze({
		at: clamp01(source.at ?? source.t ?? 1),
		direction: source.direction,
		offset: attachmentVector3(source.offset),
		point: source.point,
		target: source.target ?? source.guide ?? source.guideId ?? null
	});
}

/** Samples a centerline by normalized section position and derives its local tangent. */
function sampleCenterline(centerline, amount) {
	if (centerline.length === 1) {
		return {
			direction: [0, 0, 1],
			point: attachmentVector3(centerline[0])
		};
	}
	const scaled = clamp01(amount) * (centerline.length - 1);
	const leftIndex = Math.min(Math.floor(scaled), centerline.length - 2);
	const rightIndex = leftIndex + 1;
	const localAmount = scaled - leftIndex;
	const left = attachmentVector3(centerline[leftIndex]);
	const right = attachmentVector3(centerline[rightIndex]);
	return {
		direction: normalizeAttachmentVector(right.map((value, index) => value - left[index])),
		point: interpolateAttachmentVectors(left, right, localAmount)
	};
}

/** Applies offset and direction normalization to the final immutable anchor record. */
function finalizeAnchor(intent, point, direction) {
	return Object.freeze({
		at: intent.at,
		direction: Object.freeze(normalizeAttachmentVector(direction)),
		point: Object.freeze(addAttachmentVectors(point, intent.offset)),
		target: intent.target
	});
}

/** Clamps normalized guide coordinates without allowing NaN to escape. */
function clamp01(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return 1;
	}
	return Math.max(0, Math.min(1, number));
}
