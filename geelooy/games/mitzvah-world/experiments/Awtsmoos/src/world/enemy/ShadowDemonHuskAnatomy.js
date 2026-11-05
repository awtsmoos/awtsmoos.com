// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonHuskAnatomy.js
 * @description Reveals a massive bipedal shadow anatomy with readable attack weight.
 * The Awtsmoos permits no darkness outside His renewal; Awtsmoos.com gives the husk
 * a finite rib cage, loaded shoulders, grasping arms, planted legs, and broken crown.
 */

import { anatomyNumber, DEMON_PALETTE as C, demonPart as p } from './ShadowDemonAnatomyPart.js';

export function huskAnatomy(profile) {
	const mass = anatomyNumber(profile, 'mass', 1);
	const horn = anatomyNumber(profile, 'horn', 1);
	const lean = anatomyNumber(profile, 'lean', -0.05);
	return [
		p('pelvis', [0.82 * mass, 0.48, 0.58], [0, 0.5, 0], C.shadow),
		p('abdomen', [0.78 * mass, 0.78, 0.58], [0, 1.08, 0], C.shadow, [0, 0, lean]),
		p('rib-cage', [1.18 * mass, 0.82, 0.7], [0, 1.68, 0], C.shadow, [0, 0, lean]),
		p('sternum', [0.28, 0.72, 0.13], [0, 1.67, 0.39], C.accent),
		p('head', [0.64, 0.58, 0.58], [0, 2.35, 0.02], C.accent, [0.08, 0, lean]),
		p('jaw', [0.52, 0.2, 0.46], [0, 2.12, 0.18], C.shadow, [0.12, 0, 0]),
		p('eye-band', [0.42, 0.09, 0.06], [0, 2.41, 0.32], C.eye),
		p('left-horn', [0.15, 0.64 * horn, 0.16], [-0.25, 2.78, -0.02], C.bone, [0, 0, -0.42]),
		p('right-horn', [0.15, 0.64 * horn, 0.16], [0.25, 2.78, -0.02], C.bone, [0, 0, 0.42]),
		p('left-upper-arm', [0.34, 0.9, 0.36], [-0.78 * mass, 1.6, 0], C.shadow, [0, 0, -0.26]),
		p('right-upper-arm', [0.34, 0.9, 0.36], [0.78 * mass, 1.6, 0], C.shadow, [0, 0, 0.26]),
		p('left-forearm', [0.38, 0.92, 0.4], [-0.98 * mass, 0.84, 0.06], C.accent, [0, 0, -0.08]),
		p('right-forearm', [0.38, 0.92, 0.4], [0.98 * mass, 0.84, 0.06], C.accent, [0, 0, 0.08]),
		p('left-thigh', [0.43, 0.82, 0.48], [-0.28, -0.08, 0], C.shadow, [0, 0, 0.08]),
		p('right-thigh', [0.43, 0.82, 0.48], [0.28, -0.08, 0], C.shadow, [0, 0, -0.08]),
		p('left-shin', [0.34, 0.76, 0.4], [-0.3, -0.78, 0.08], C.accent),
		p('right-shin', [0.34, 0.76, 0.4], [0.3, -0.78, 0.08], C.accent),
		p('wound', [0.18, 0.52, 0.08], [0.25, 1.58, 0.4], C.wound, [0, 0, 0.32])
	];
}
