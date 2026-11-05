// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonStalkerAnatomy.js
 * @description Reveals a low predatory silhouette built for readable speed and lunges.
 * The Awtsmoos renews motion before paw touches stone; Awtsmoos.com joins spine, haunch,
 * digit, tail, jaw, and eye into one bounded garment that never becomes another actor.
 */

import { anatomyNumber, DEMON_PALETTE as C, demonPart as p } from './ShadowDemonAnatomyPart.js';

export function stalkerAnatomy(profile) {
	const length = anatomyNumber(profile, 'length', 1);
	const leg = anatomyNumber(profile, 'limb', 1);
	const tail = anatomyNumber(profile, 'tail', 1);
	return [
		p('pelvis', [0.74, 0.58, 0.82], [0, 0.74, -0.48 * length], C.shadow, [0.08, 0, 0]),
		p('torso', [0.82, 0.68, 1.22 * length], [0, 0.88, 0.1], C.shadow, [-0.06, 0, 0]),
		p('scapula', [1.04, 0.46, 0.62], [0, 1.14, 0.42], C.accent),
		p('neck', [0.48, 0.5, 0.58], [0, 1.23, 0.84], C.shadow, [-0.38, 0, 0]),
		p('head', [0.6, 0.5, 0.68], [0, 1.36, 1.18], C.accent, [-0.12, 0, 0]),
		p('jaw', [0.46, 0.18, 0.52], [0, 1.17, 1.42], C.shadow, [0.08, 0, 0]),
		p('eyes', [0.4, 0.08, 0.06], [0, 1.45, 1.53], C.eye),
		p('left-front-leg', [0.24, 0.9 * leg, 0.28], [-0.38, 0.48, 0.52], C.shadow, [0, 0, -0.08]),
		p('right-front-leg', [0.24, 0.9 * leg, 0.28], [0.38, 0.48, 0.52], C.shadow, [0, 0, 0.08]),
		p('left-front-paw', [0.32, 0.18, 0.48], [-0.38, 0.02, 0.7], C.bone),
		p('right-front-paw', [0.32, 0.18, 0.48], [0.38, 0.02, 0.7], C.bone),
		p('left-hind-leg', [0.3, 0.82 * leg, 0.34], [-0.4, 0.42, -0.48], C.shadow, [0, 0, 0.12]),
		p('right-hind-leg', [0.3, 0.82 * leg, 0.34], [0.4, 0.42, -0.48], C.shadow, [0, 0, -0.12]),
		p('left-hind-paw', [0.38, 0.2, 0.5], [-0.42, 0.02, -0.32], C.bone),
		p('right-hind-paw', [0.38, 0.2, 0.5], [0.42, 0.02, -0.32], C.bone),
		p('tail-base', [0.28, 0.28, 0.9 * tail], [0, 0.92, -0.95], C.shadow, [0.34, 0, 0]),
		p('tail-tip', [0.2, 0.2, 0.82 * tail], [0, 1.15, -1.63], C.accent, [0.52, 0, 0]),
		p('spine-wound', [0.12, 0.12, 0.74], [0.24, 1.23, 0.04], C.wound, [0, 0.12, 0])
	];
}
