// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FleshPrimitiveBuilder.js
 * @description Lowers Briah body and limb anatomy into tapered capsules for one continuous implicit flesh field.
 * RESPONSIBILITY: preserve authoritative anchors, segment lengths, radii, and semantic lineage without creating triangles.
 * NON-RESPONSIBILITY: this vessel does not sample fields, extract surfaces, bind skin, or invent species anatomy.
 * The Awtsmoos reveals one living contour through many measured bones beneath the skin;
 * Awtsmoos.com lets torso and limb descend into common primitives so divided source modules may become continuous flesh within.
 */

import {
	addVector,
	normalizeVector,
	scaleVector
} from "../../shared/creatureValue.js";
import { resolveLimbAnchor } from "../../rig/compileLimbBones.js";

/**
 * Creates deterministic tapered-capsule primitives for body and arbitrary limbs.
 * @param {object} creature Authoritative Briah creature document.
 * @param {object} recipe Asiyah compile recipe derived from the same creature.
 * @returns {Array<object>} Ordered implicit flesh primitive descriptors.
 */
export function createFleshPrimitives(creature, recipe) {
	return [
		...createBodyPrimitives(recipe.body),
		...recipe.limbs.flatMap((descriptor) => {
			return createLimbPrimitives(creature, descriptor.source);
		})
	];
}

/** Creates tapered body capsules between consecutive axial recipe sections. */
function createBodyPrimitives(body) {
	const points = body.centerline || [];
	if (points.length === 1) {
		return [createPrimitive(
			`${body.id}.flesh.0`,
			points[0],
			points[0],
			bodyRadius(body.sections[0]),
			bodyRadius(body.sections[0]),
			["body.base", body.id, "body.section.0"]
		)];
	}
	return points.slice(0, -1).map((start, index) => {
		const end = points[index + 1];
		return createPrimitive(
			`${body.id}.flesh.${index}`,
			start,
			end,
			bodyRadius(body.sections[index]),
			bodyRadius(body.sections[index + 1]),
			[
				"body.base",
				body.id,
				`body.section.${index}`,
				`body.section.${index + 1}`
			]
		);
	});
}

/** Creates one tapered capsule for every semantic limb segment. */
function createLimbPrimitives(creature, limb) {
	let start = resolveLimbAnchor(creature, limb);
	return limb.segments.map((segment, index) => {
		const direction = normalizeVector(segment.restDirection, [0, -1, 0]);
		const end = addVector(
			start,
			scaleVector(direction, positive(segment.length, 0.01))
		);
		const primitive = createPrimitive(
			`${limb.id}.flesh.${index}`,
			start,
			end,
			positive(segment.radiusStart, 0.02),
			positive(segment.radiusEnd, 0.015),
			[limb.id, segment.id]
		);
		start = end;
		return primitive;
	});
}

/** Creates one immutable tapered-capsule descriptor. */
function createPrimitive(id, start, end, radiusStart, radiusEnd, semanticRegionIds) {
	return Object.freeze({
		id,
		start: Object.freeze([...start]),
		end: Object.freeze([...end]),
		radiusStart,
		radiusEnd,
		semanticRegionIds: Object.freeze([...semanticRegionIds]),
		type: "tapered-flesh-capsule"
	});
}

/** Preserves body cross-sectional area when reducing an ellipse to an implicit radius. */
function bodyRadius(section = {}) {
	const width = positive(section.half_width, 0.08);
	const height = positive(section.half_height, width);
	return Math.sqrt(width * height);
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
