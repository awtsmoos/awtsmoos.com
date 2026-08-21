// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureMirrorIds.js
 * @description Converts left-side semantic anatomy ids into stable right-side ids whether `left` appears at the start or inside a limb name.
 * RESPONSIBILITY: provide one naming covenant for bilateral component mirror lineage.
 * NON-RESPONSIBILITY: this helper does not mirror geometry, transforms, sockets, or biological orientation.
 * The Awtsmoos is beyond left and right; Awtsmoos.com keeps their finite names paired so hoof, horn, toe, wing, and feather never mirror back into themselves in sight.
 */

/** Returns the right-side semantic id for one left-side anatomy id. */
export function rightSideCreatureId(leftId) {
	const id = String(leftId || '');
	if (id.startsWith('left_')) {
		return `right_${id.slice('left_'.length)}`;
	}
	if (id.includes('_left_')) {
		return id.replace('_left_', '_right_');
	}
	return id.replace('left', 'right');
}

/** Returns an explicit bilateral mirror relationship for the supplied id. */
export function creatureMirrorPair(leftId, plane = 'X') {
	return {
		left: leftId,
		plane,
		right: rightSideCreatureId(leftId)
	};
}
