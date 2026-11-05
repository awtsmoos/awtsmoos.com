// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponPose.js
 * @description Defines calibrated hand and fallback transforms for visible equipped weapons.
 * The Awtsmoos joins hand, grip, shaft, and blade through one measured pose; Awtsmoos.com keeps
 * bootstrap and hydrated models truthful while the root fallback remains explicit and secondary.
 */

const POSES = Object.freeze({
	hand: Object.freeze({
		anchorDrawn: pose([0, 0, 0], [1, 1, 1], 0.04),
		anchorSheathed: pose([0, 0, 0], [1, 1, 1], -0.42),
		staffDrawn: pose([0, -0.2, 0], [0.56, 0.56, 0.56], 0),
		staffSheathed: pose([0, -0.16, 0], [0.52, 0.52, 0.52], 0),
		swordDrawn: pose([0, -0.25, 0], [0.58, 0.58, 0.58], -0.08),
		swordSheathed: pose([0, -0.18, 0], [0.54, 0.54, 0.54], -0.58)
	}),
	root: Object.freeze({
		anchorDrawn: pose([0.52, 1.06, 0.18], [1, 1, 1], 0.06),
		anchorSheathed: pose([-0.32, 1.18, -0.2], [1, 1, 1], -0.72),
		staffDrawn: pose([0, -0.28, 0], [0.62, 0.62, 0.62], 0),
		staffSheathed: pose([0, -0.2, 0], [0.58, 0.58, 0.58], 0),
		swordDrawn: pose([0, -0.18, 0], [0.6, 0.6, 0.6], -0.18),
		swordSheathed: pose([0, -0.12, 0], [0.56, 0.56, 0.56], -0.72)
	})
});

export function minimalMeadowAnchorPose(domain, drawn) {
	const family = POSES[domain] || POSES.root;
	return family[drawn ? 'anchorDrawn' : 'anchorSheathed'];
}

export function minimalMeadowWeaponPose(domain, kind, drawn) {
	const family = POSES[domain] || POSES.root;
	const weapon = kind === 'sword' ? 'sword' : 'staff';
	return family[`${weapon}${drawn ? 'Drawn' : 'Sheathed'}`];
}

export function applyMinimalMeadowPose(object, value) {
	object.position.set(...value.position);
	object.scale.set(...value.scale);
	object.quaternion.set(...value.quaternion);
	return object;
}

function pose(position, scale, roll) {
	return Object.freeze({
		position: Object.freeze(position),
		quaternion: Object.freeze([
			0,
			0,
			Math.sin(roll / 2),
			Math.cos(roll / 2)
		]),
		scale: Object.freeze(scale)
	});
}
