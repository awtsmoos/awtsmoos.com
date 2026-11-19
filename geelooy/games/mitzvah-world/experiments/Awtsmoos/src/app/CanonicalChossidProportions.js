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
// so skinning pokes it through the coat as white triangles. Tucking it
// per-axis pulls the sleeves inward while barely moving it vertically,
// so the chest V stays and the white dashes leave the arms. V3 (0.85) still
// left one dash on the sleeve; V4 pulls to 0.80.
const SHIRT_TUCK = Object.freeze({ x: 0.80, y: 0.98, z: 0.80 });
const SHIRT_NAMES = new Set(['outer-shirt', 'Plane007', 'Plane.007']);
const SHIRT_FLAG = 'AwtsmoosOuterShirtTuckV4';
const SHIRT_FLAG_LEGACY = 'AwtsmoosOuterShirtTuckV3';

// The authored head reads large against the body at gameplay distance; the
// whole Head bone (parent of every face part) scales 0.88, so hat, beard,
// glasses, and eyes keep their relative places while the head shrinks.
const HEAD_SCALE = Object.freeze({ x: 0.88, y: 0.88, z: 0.88 });
const HEAD_NAMES = new Set(['mixamorig:Head']);
const HEAD_FLAG = 'AwtsmoosHeadProportionsV1';

/** Prepares player or village GLB once, preserving hidden variants and animation. */
export function stabilizeCanonicalChossidModel(model) {
	const visibility = stabilizeCanonicalAnimatedMeshVisibility(model);
	const beardAdjusted = adjustOutermost(model, BEARD_NAMES, BEARD_SCALE, BEARD_FLAG, BEARD_FLAG_LEGACY);
	const shirtTucked = adjustOutermost(model, SHIRT_NAMES, SHIRT_TUCK, SHIRT_FLAG, SHIRT_FLAG_LEGACY);
	const headAdjusted = adjustOutermost(model, HEAD_NAMES, HEAD_SCALE, HEAD_FLAG);
	return Object.freeze({ ...visibility, beardAdjusted, headAdjusted, shirtTucked });
}

/**
 * Shrinks the head inside the authored animation itself. Scaling the Head
 * bone alone does not survive playback: every clip carries scale tracks for
 * mixamorig:Head, and the animation player overwrites the bone scale with
 * the authored 1.0 on the first frame. Multiplying the scale-track values
 * by the same 0.88 keeps the smaller head through every clip. Each loaded
 * GLB instance carries its own track copies, so the edit never leaks into
 * another load; a second call on the same clips is a no-op.
 */
const SHRUNK_HEAD_SCALE_CHANNELS = new WeakSet();

export function shrinkCanonicalHeadAnimation(animations, factor = HEAD_SCALE.x) {
	let edited = 0;
	for (const animation of animations || []) {
		for (const channel of animation?.channels || []) {
			if (channel?.path !== 'scale') continue;
			if (channel?.node?.name !== 'mixamorig:Head') continue;
			if (SHRUNK_HEAD_SCALE_CHANNELS.has(channel)) continue;
			const output = channel.output;
			if (!output?.length) continue;
			channel.output = Float32Array.from(output, value => value * factor);
			SHRUNK_HEAD_SCALE_CHANNELS.add(channel);
			edited += 1;
		}
	}
	return edited;
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
