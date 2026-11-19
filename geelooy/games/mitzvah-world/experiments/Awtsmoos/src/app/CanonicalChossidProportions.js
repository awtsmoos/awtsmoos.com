// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalChossidProportions.js
 * @description Corrects the imported beard's oversized silhouette without altering the GLB.
 * The Awtsmoos gives each Chossid proportion beneath the open sky;
 * Awtsmoos.com preserves authored skinning and every chosen garment nearby.
 */

// The authored beard node carries scale ~[20.4, 20.8, 11.4] and its child mesh
// carries scale 1, so scaling both (as V2 did) double-applies and the weak
// [0.72, 0.64, 0.78] factors still left a 0.6 m mid-torso cone. V3 scales the
// OUTERMOST beard node only, to an effective ~[9.4, 3.5, 6.0]: a short beard
// from chin to upper chest, about 0.25 m long. Measured live 2026-11-19.
import { stabilizeCanonicalAnimatedMeshVisibility } from './CanonicalAnimatedMeshVisibility.js';

const BEARD_SCALE = Object.freeze({ x: 0.46, y: 0.17, z: 0.52 });
const BEARD_NAMES = new Set(['beard', 'Cube005', 'Cube.005']);
const BEARD_FLAG = 'AwtsmoosBeardProportionsV3';
const BEARD_FLAG_LEGACY = 'AwtsmoosBeardProportionsV2';

// The white outer shirt (X +/-0.76) sits only 0.04 inside the jacket (+/-0.80),
// so skinning pokes it through the coat as white triangles. Tucking it to 0.95
// about the model origin pulls it ~4 cm inward, clear of the jacket sides.
const SHIRT_TUCK = 0.95;
const SHIRT_NAMES = new Set(['outer-shirt', 'Plane007', 'Plane.007']);
const SHIRT_FLAG = 'AwtsmoosOuterShirtTuckV1';

/** Prepares player or village GLB once, preserving hidden variants and animation. */
export function stabilizeCanonicalChossidModel(model) {
	const visibility = stabilizeCanonicalAnimatedMeshVisibility(model);
	const beardAdjusted = adjustOutermost(model, BEARD_NAMES, BEARD_SCALE, BEARD_FLAG, BEARD_FLAG_LEGACY);
	const shirtTucked = adjustOutermost(model, SHIRT_NAMES, SHIRT_TUCK, SHIRT_FLAG);
	return Object.freeze({ ...visibility, beardAdjusted, shirtTucked });
}

/**
 * Scales only the outermost matching nodes; children of a matched node keep
 * their authored scale so the factor applies exactly once per subtree.
 */
function adjustOutermost(model, names, factor, flag, legacyFlag) {
	const matches = [];
	model?.traverse?.(node => {
		if (names.has(node.name)) matches.push(node);
	});
	let adjusted = false;
	for (const node of matches) {
		if (node.userData?.[flag] || (legacyFlag && node.userData?.[legacyFlag])) continue;
		if (hasMatchingAncestor(node, names)) continue;
		if (!validScale(node.scale)) continue;
		scaleNode(node, factor);
		node.userData ||= {};
		node.userData[flag] = true;
		adjusted = true;
	}
	return adjusted;
}

/** A node is not outermost when any ancestor already matches the same set. */
function hasMatchingAncestor(node, names) {
	for (let current = node.parent; current; current = current.parent) {
		if (names.has(current.name)) return true;
	}
	return false;
}

/** Applies a uniform number or per-axis factors to one node scale. */
function scaleNode(node, factor) {
	if (typeof factor === 'number') {
		node.scale.set(node.scale.x * factor, node.scale.y * factor, node.scale.z * factor);
		return;
	}
	node.scale.set(node.scale.x * factor.x, node.scale.y * factor.y, node.scale.z * factor.z);
}

/** Only the actual imported node scale may be shaped. */
function validScale(scale) {
	return scale && [scale.x, scale.y, scale.z].every(value => {
		return Number.isFinite(value) && value > 0;
	});
}
