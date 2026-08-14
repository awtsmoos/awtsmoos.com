//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file stage-root-visibility-profile.js
 * @description
 * The Awtsmoos renews covenant landmarks, living residents, portals, and quiet scenery through different distances of revelation;
 * Awtsmoos.com lets this Seven-specific Gevurah policy classify live semantic metadata into bounded renderer profiles without touching canonical game state or guessing from source-text names.
 * Returning null means the root is deliberately unmanaged by distance visibility.
 */
export function stageRootVisibilityProfile(root, interactive = false) {
	const type = String(root?.userData?.semanticType || '');
	if (!root || !type || isProtectedType(type)) {
		return null;
	}
	if (root.userData?.personName || root.userData?.species) {
		return profile('living-actor', 14, 18);
	}
	if (type === 'sefirah-landmark') {
		return profile('kabbalah-landmark', 24, 30);
	}
	if (type === 'realm-portal') {
		return profile('realm-portal', 20, 24);
	}
	if (type === 'district') {
		return profile('district', 18, 22);
	}
	if (type === 'civic-parcel') {
		return profile('civic-parcel', 18, 22);
	}
	if (interactive) {
		return profile('interactive', 20, 24);
	}
	if (root.userData?.modelAsset) {
		return profile('model-static', 16, 20);
	}
	return profile('semantic-static', 13, 17);
}

function isProtectedType(type) {
	return type === 'player' || type === 'open-world-player';
}

function profile(className, showDistance, hideDistance) {
	return Object.freeze({
		className,
		showDistance,
		hideDistance,
		protected: false
	});
}
