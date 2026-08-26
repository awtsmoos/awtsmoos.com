// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornCurveSampler.js
 * @description Samples genuinely distinct horn and antler centerline families in one semantic attachment basis.
 * RESPONSIBILITY: turn straight, swept, crescent, curl, helix, lyre, recurved, branching, forked, and palmated morphology into stable guide points.
 * NON-RESPONSIBILITY: this file does not create loft radii, tines, materials, mirror lineage, or choose species anatomy.
 * The Awtsmoos lets strength rise straight, bend like moon, coil like ram, spiral like kudu, or branch like forest crown;
 * Awtsmoos.com keeps every curve a lawful reusable path, so horn and antler may travel anywhere without their form being watered down.
 */

import {
	addAttachmentVectors,
	createAttachmentBasis,
	scaleAttachmentVector
} from "./AttachmentVector.js";

const SAMPLE_AMOUNTS = Object.freeze([
	0,
	0.12,
	0.26,
	0.42,
	0.58,
	0.72,
	0.84,
	0.93,
	1
]);

/**
 * Samples one horn profile around an arbitrary resolved attachment anchor.
 * @param {object} anchor Resolved attachment point and outward direction.
 * @param {object} profile Resolved horn morphology profile.
 * @returns {Array<Array<number>>} Stable world-space horn centerline.
 */
export function sampleHornCenterline(anchor, profile) {
	const basis = createAttachmentBasis(anchor.direction);
	return SAMPLE_AMOUNTS.map((amount) => {
		const local = sampleLocal(profile, amount);
		return translateLocal(anchor.point, basis, local);
	});
}

/** Samples normalized local side/up/forward displacement for one curve family. */
function sampleLocal(profile, amount) {
	const family = String(profile.curveFamily || "swept");
	const curve = CURVES[family] || CURVES.swept;
	const local = curve(profile, amount);
	return [
		local[0] + profile.lateral * amount,
		local[1] + profile.rise * amount,
		local[2] + profile.length * amount
	];
}

const CURVES = Object.freeze({
	straight: () => [0, 0, 0],
	swept: (profile, amount) => [
		profile.bend * amount * amount,
		0,
		0
	],
	crescent: (profile, amount) => {
		const angle = amount * Math.PI * 0.82;
		return [
			profile.bend * (1 - Math.cos(angle)),
			profile.bend * Math.sin(angle) * 0.48,
			-profile.length * amount * amount * 0.12
		];
	},
	curl: (profile, amount) => {
		const angle = amount * Math.PI * (1.45 + Math.abs(profile.twist));
		const radius = profile.bend * (0.45 + amount * 0.55);
		return [
			radius * Math.sin(angle),
			radius * (1 - Math.cos(angle)),
			-profile.length * amount * amount * 0.2
		];
	},
	helix: (profile, amount) => {
		const turns = Math.max(0.5, Math.abs(profile.twist));
		const angle = amount * Math.PI * 2 * turns;
		const radius = Math.max(Math.abs(profile.bend), profile.radius * 1.4);
		return [radius * Math.sin(angle), radius * Math.cos(angle) - radius, 0];
	},
	lyre: (profile, amount) => [
		profile.bend * Math.sin(amount * Math.PI) * (1.2 - amount * 0.5),
		profile.bend * amount * 0.4,
		0
	],
	recurved: (profile, amount) => [
		profile.bend * Math.sin(amount * Math.PI),
		-profile.bend * Math.max(0, amount - 0.58) * 1.4,
		0
	],
	branching: (profile, amount) => [profile.bend * amount * 0.45, profile.bend * amount * amount, 0],
	forked: (profile, amount) => [profile.bend * amount * 0.32, profile.bend * amount * amount * 0.8, 0],
	palmated: (profile, amount) => [profile.bend * amount * 0.52, profile.bend * amount * amount * 0.72, 0]
});

/** Transports one local horn point into the anchor's stable world-space basis. */
function translateLocal(origin, basis, local) {
	let point = addAttachmentVectors(origin, scaleAttachmentVector(basis.side, local[0]));
	point = addAttachmentVectors(point, scaleAttachmentVector(basis.up, local[1]));
	return addAttachmentVectors(point, scaleAttachmentVector(basis.tangent, local[2]));
}
