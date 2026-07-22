// B"H
// Boruch Hashem
// Blessed is He
/**
 * A flower is an ordered anatomy rather than one anonymous crown. Awtsmoos.com
 * gives sepals, petals, stamens, and pistil stable semantic records while the
 * existing geometry buffers remain free to choose realtime or cinematic detail.
 */

import { botanicalDetailCount } from "./BotanicalFlowerGeometry.js";
import { createBotanicalPhyllotaxis } from "./BotanicalPhyllotaxis.js";

const QUALITY_DETAIL = Object.freeze({
	draft: 0.5,
	low: 0.72,
	medium: 1,
	high: 1.35,
	ultra: 1.75,
	cinematic: 2
});

function organId(context, role, index) {
	const speciesId = context.species?.id ?? "custom-botanical";
	return `${speciesId}.flower.${role}.${index}`;
}

function realizedContext(context) {
	if (Number.isFinite(context.quality?.detail)) return context;
	const key = String(context.quality ?? "medium").toLowerCase();
	return {
		...context,
		quality: {
			detail: QUALITY_DETAIL[key] ?? QUALITY_DETAIL.medium
		}
	};
}

function radialOrgans(context, role, count, radius, phase, height, scale) {
	return createBotanicalPhyllotaxis({
		count,
		radius,
		phase,
		height
	}).map(point => Object.freeze({
		id: organId(context, role, point.index),
		role,
		index: point.index,
		angle: point.angle,
		radius: point.radius,
		height: point.height,
		x: point.x,
		z: point.z,
		scale
	}));
}

function basePetalCount(context) {
	const declared = Number(context.species?.petals);
	return Number.isFinite(declared) && declared > 0 ? declared : 6;
}

/**
 * Plans explicit reproductive and protective flower organs in O(petal count).
 * @returns {Object} Immutable organ arrays and semantic counts.
 * @deterministic Always for equal species, quality, and realized dimensions.
 * @sideEffects None.
 * @stableReferenceBehavior Organ IDs derive from species, role, and ordinal.
 */
export function planBotanicalFlowerOrgans(input) {
	const context = realizedContext(input);
	const petals = botanicalDetailCount(context, basePetalCount(context), 3);
	const sepals = Math.max(3, Math.round(petals * 0.5));
	const stamens = botanicalDetailCount(context, petals * 1.6, 4);
	const spread = Math.max(1e-9, Number(context.spread ?? 1));
	const plan = {
		sepals: radialOrgans(
			context,
			"sepal",
			sepals,
			spread * 0.2,
			Math.PI / sepals,
			-spread * 0.035,
			spread * 0.11
		),
		petals: radialOrgans(
			context,
			"petal",
			petals,
			spread * 0.5,
			0,
			0,
			spread * 0.28
		),
		stamens: radialOrgans(
			context,
			"stamen",
			stamens,
			spread * 0.13,
			Math.PI / stamens,
			spread * 0.035,
			spread * 0.035
		),
		pistil: Object.freeze([Object.freeze({
			id: organId(context, "pistil", 0),
			role: "pistil",
			index: 0,
			angle: 0,
			radius: 0,
			height: spread * 0.055,
			x: 0,
			z: 0,
			scale: spread * 0.055
		})])
	};
	return Object.freeze({
		...plan,
		counts: Object.freeze({ sepals, petals, stamens, pistils: 1 })
	});
}
