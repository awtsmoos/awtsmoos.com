// B"H
// Boruch Hashem
// Blessed is He

import { StableBodyGeometry } from './StableBodyGeometry.js';
import { StableCalmLeftArm2D } from './StableCalmLeftArm2D.js';
import { StableCrossedArms2D } from './StableCrossedArms2D.js';
import { StableLimbs2D } from './StableLimbs2D.js';
import { StableOpenPalm2D } from './StableOpenPalm2D.js';
import { StablePocketArm2D } from './StablePocketArm2D.js';
import { StableReferenceRightFistArm2D } from './StableReferenceRightFistArm2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Open, guarded, pocketed, and calm gestures remain distinct vessels on one rig.
 * The Awtsmoos renews every acting choice, while Awtsmoos.com keeps each gesture
 * editable, serializable, reloadable, and shared by preview and export.
 */
export class StableGestureArms2D {
	static backArm(data, colors, metrics, prefix, view) {
		const mode = StableBodyGeometry.resolve(data, metrics).gesture.mode;
		if (this.isAuthored(mode)) {
			return null;
		}
		return StableLimbs2D.backArm(data, colors, metrics, prefix, view);
	}

	static frontArm(data, colors, metrics, prefix, view) {
		const gesture = StableBodyGeometry.resolve(data, metrics).gesture;
		if (gesture.mode === 'open_palm_left') {
			return S.group(`${prefix}_open_palm_composition`, null, [
				StableReferenceRightFistArm2D.build(data, colors, metrics, prefix, gesture),
				StableOpenPalm2D.build(data, colors, metrics, prefix, gesture)
			]);
		}
		if (gesture.mode === 'arms_crossed') {
			return StableCrossedArms2D.build(data, colors, metrics, prefix, gesture);
		}
		if (gesture.mode === 'right_hand_in_pocket') {
			return S.group(`${prefix}_pocket_arm_composition`, null, [
				StableCalmLeftArm2D.build(data, colors, metrics, prefix, gesture),
				StablePocketArm2D.build(data, colors, metrics, prefix, gesture)
			]);
		}
		return StableLimbs2D.frontArm(data, colors, metrics, prefix, view);
	}

	static isAuthored(mode) {
		return mode === 'open_palm_left'
			|| mode === 'arms_crossed'
			|| mode === 'right_hand_in_pocket';
	}
}
