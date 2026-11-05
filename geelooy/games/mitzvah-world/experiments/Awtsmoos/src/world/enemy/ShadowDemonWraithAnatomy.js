// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonWraithAnatomy.js
 * @description Reveals a floating ritual silhouette with veil, crown, and grasping arms.
 * The Awtsmoos creates even concealment every instant; Awtsmoos.com binds the wraith's
 * mist, column, face, veil, crown, hands, and luminous fracture into one finite draw.
 */

import { anatomyNumber, DEMON_PALETTE as C, demonPart as p } from './ShadowDemonAnatomyPart.js';

export function wraithAnatomy(profile) {
	const height = anatomyNumber(profile, 'height', 1);
	const veil = anatomyNumber(profile, 'veil', 1);
	const crown = anatomyNumber(profile, 'horn', 1);
	return [
		p('mist-base', [1.5 * veil, 0.24, 1.22 * veil], [0, 0.12, 0], C.accent),
		p('lower-column', [0.72, 0.92 * height, 0.62], [0, 0.68, 0], C.shadow, [0.04, 0, 0]),
		p('upper-column', [0.84, 0.86 * height, 0.68], [0, 1.48, 0], C.shadow, [-0.05, 0, 0]),
		p('rib-veil', [1.3 * veil, 0.46, 0.22], [0, 1.58, 0.18], C.accent, [0.18, 0, 0]),
		p('head', [0.58, 0.66, 0.54], [0, 2.2 * height, 0.02], C.accent),
		p('face-plane', [0.42, 0.42, 0.08], [0, 2.2 * height, 0.31], C.shadow),
		p('eyes', [0.36, 0.09, 0.05], [0, 2.28 * height, 0.37], C.eye),
		p('left-crown', [0.12, 0.64 * crown, 0.12], [-0.22, 2.67 * height, 0], C.bone, [0, 0, -0.34]),
		p('right-crown', [0.12, 0.64 * crown, 0.12], [0.22, 2.67 * height, 0], C.bone, [0, 0, 0.34]),
		p('left-arm', [0.24, 1.18, 0.28], [-0.66 * veil, 1.48, 0], C.shadow, [0, 0, -0.4]),
		p('right-arm', [0.24, 1.18, 0.28], [0.66 * veil, 1.48, 0], C.shadow, [0, 0, 0.4]),
		p('left-hand', [0.34, 0.26, 0.4], [-0.94 * veil, 0.96, 0.08], C.bone, [0.12, 0, -0.18]),
		p('right-hand', [0.34, 0.26, 0.4], [0.94 * veil, 0.96, 0.08], C.bone, [0.12, 0, 0.18]),
		p('heart-fracture', [0.16, 0.62, 0.08], [-0.16, 1.55, 0.39], C.wound, [0, 0, -0.28])
	];
}
