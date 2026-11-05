// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAnchor.js
 * @description Creates one generation-owned right-hand anchor and removes every stale duplicate.
 * The Awtsmoos joins tool to hand rather than nearby space; Awtsmoos.com makes hydration replace
 * old anchors cleanly while the explicit model-root fallback remains visible in diagnostics.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	applyMinimalMeadowPose,
	minimalMeadowAnchorPose
} from './MinimalMeadowWeaponPose.js';

const ANCHOR_NAME = 'Awtsmoos_equipped_weapon_hand_anchor';

export function resolveMinimalMeadowWeaponAnchor(
	nodes,
	drawn = true,
	generation = 0
) {
	const parent = nodes?.rightHand?.add ? nodes.rightHand : nodes?.modelRoot;
	if (!parent?.add) return null;
	const domain = parent === nodes.rightHand ? 'hand' : 'root';
	let anchor = parent.children?.find?.(child => child.name === ANCHOR_NAME);
	if (!anchor) {
		anchor = new Group();
		anchor.name = ANCHOR_NAME;
		parent.add(anchor);
	}
	removeDuplicateMinimalMeadowWeaponAnchors(nodes?.modelRoot, anchor);
	anchor.visible = true;
	anchor.userData.AwtsmoosWeaponAnchor = {
		attachmentDomain: domain,
		drawn: Boolean(drawn),
		fallback: domain === 'root',
		generation: Number(generation) || 0,
		parent: parent.name || domain
	};
	parent.visible = true;
	applyAnchorTransform(anchor, drawn);
	return anchor;
}

export function removeDuplicateMinimalMeadowWeaponAnchors(model, keep = null) {
	const anchors = [];
	model?.traverse?.(node => {
		if (node.name === ANCHOR_NAME) anchors.push(node);
	});
	let removed = 0;
	for (const anchor of anchors) {
		if (anchor === keep) continue;
		anchor.parent?.remove?.(anchor);
		anchor.visible = false;
		removed += 1;
	}
	return removed;
}

export function applyAnchorTransform(anchor, drawn) {
	const domain = anchor.userData?.AwtsmoosWeaponAnchor?.attachmentDomain || 'root';
	applyMinimalMeadowPose(anchor, minimalMeadowAnchorPose(domain, drawn));
	anchor.visible = true;
	anchor.userData.AwtsmoosWeaponAnchor.drawn = Boolean(drawn);
	return anchor;
}

export const MINIMAL_MEADOW_WEAPON_ANCHOR_NAME = ANCHOR_NAME;
