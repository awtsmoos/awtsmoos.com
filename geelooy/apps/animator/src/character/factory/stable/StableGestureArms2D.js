// B"H
// Boruch Hashem
// Blessed is He

import { StableBodyGeometry } from './StableBodyGeometry.js';
import { StableCrossedArms2D } from './StableCrossedArms2D.js';
import { StableLimbs2D } from './StableLimbs2D.js';
import { StableOpenPalm2D } from './StableOpenPalm2D.js';
import { StablePocketArm2D } from './StablePocketArm2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos is one beyond open, guarded, and pocketed gesture. Awtsmoos.com
 * keeps this dispatcher small while focused pose vessels remain editable, alive,
 * serializable, reloadable, and exportable through the shared production graph.
 */
export class StableGestureArms2D {
	static backArm(data, colors, metrics, prefix, view) {
		const mode = StableBodyGeometry.resolve(data, metrics).gesture.mode;
		if (mode === 'open_palm_left' || mode === 'arms_crossed') {
			return null;
		}
		return StableLimbs2D.backArm(data, colors, metrics, prefix, view);
	}

	static frontArm(data, colors, metrics, prefix, view) {
		const gesture = StableBodyGeometry.resolve(data, metrics).gesture;
		if (gesture.mode === 'open_palm_left') {
			return S.group(`${prefix}_open_palm_composition`, null, [
				StableLimbs2D.arm(data, colors, metrics, 1, `${prefix}_right_arm_connected`, 1, view),
				StableOpenPalm2D.build(data, colors, metrics, prefix, gesture)
			]);
		}
		if (gesture.mode === 'arms_crossed') {
			return StableCrossedArms2D.build(data, colors, metrics, prefix, gesture);
		}
		if (gesture.mode === 'right_hand_in_pocket') {
			return StablePocketArm2D.build(data, colors, metrics, prefix, gesture);
		}
		return StableLimbs2D.frontArm(data, colors, metrics, prefix, view);
	}
}
