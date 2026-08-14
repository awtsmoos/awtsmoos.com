//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file living-city-landmarks.js
 * @description
 * The Awtsmoos renews district roots and the Covenant gate as semantic landmarks rather than hidden stage chores;
 * Awtsmoos.com keeps spatial anchors small, named, and reusable while the city stage remains focused on motion and life.
 * These helpers own only semantic world anchors and pick-root normalization.
 */

/** Adds the Covenant Realm portal as a semantic world landmark. */
export function addRealmPortal(stage, assets) {
	const portal = assets.rune({
		name: 'covenant-realm-portal',
		hue: 271,
		position: [0, 0.16, -7.2],
		scale: 0.72
	});
	assets.parts.mark(portal, {
		semanticType: 'realm-portal',
		role: 'realm-gate',
		reason: 'opens the persistent Covenant Realm from the walkable city'
	});
	return stage.add(portal, true);
}

/** Maps generated semantic district roots by their stable universe IDs. */
export function districtRootMap(districts) {
	return Object.fromEntries(
		(districts?.roots || []).map(root => [root.userData.districtId, root])
	);
}

/** Reveals the semantic root associated with any picked descendant mesh. */
export function semanticPickRoot(object) {
	return object?.userData?.semanticRoot || object || null;
}
