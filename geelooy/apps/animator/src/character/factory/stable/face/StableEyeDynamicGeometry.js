// B"H
// Boruch Hashem
// Blessed is He

import { StableViewSpaceGaze } from '../../../performance/gaze/StableViewSpaceGaze.js';
import { StableEyeAttention } from './StableEyeAttention.js';

/**
 * Lid state and view-space gaze stay separate from identity landmarks and anatomy.
 * The Awtsmoos renews blink in light; Awtsmoos.com keeps two eyes coherent and right.
 */
export class StableEyeDynamicGeometry {
	static performance(data, mood, side, blink) {
		const face = data.renderPerformance?.face || {};
		const sideKey = side < 0 ? 'leftEyeOpenAmount' : 'rightEyeOpenAmount';
		const baseOpen = Number(face[sideKey] ?? face.eyeOpenAmount ?? 1);
		const asymmetry = Number(mood.eyeAsymmetry ?? face.eyeAsymmetry ?? 0) * side;
		const squint = Number(mood.squint ?? face.squintAmount ?? 0);
		const blinkAmount = Math.max(
			Number(blink || 0),
			Number(face.blinkAmount || 0)
		);
		return {
			lid: StableEyeAttention.clamp(
				baseOpen + asymmetry - squint - blinkAmount,
				0.08,
				1.2
			),
			upperLid: Number(mood.upperLid ?? face.upperLidAmount ?? 0),
			lowerLid: Number(mood.lowerLid ?? face.lowerLidAmount ?? 0)
		};
	}

	static width(style, authored, perspective, centerDistance) {
		const requested = Number(style.radiusX || 9.4)
			* perspective
			* Number(style.widthScale || 1)
			* authored.widthScale;
		return Math.min(
			requested,
			centerDistance * Number(style.separationRatio || 0.82)
		);
	}

	static height(style, authored, perspective, width, performance) {
		const requested = Number(style.radiusY || 8.2)
			* perspective
			* Number(style.heightScale || 1)
			* authored.heightScale
			* performance.lid;
		return Math.max(
			1.1,
			Math.min(requested, width * Number(style.maxAspect || 1.08))
		);
	}

	static pupilX(gaze, view, side, authored, width, perspective, style = {}) {
		const compensation = Number(style.viewPupilCompensation ?? 0);
		const local = StableViewSpaceGaze.localX(gaze, view, side, style);
		return StableEyeAttention.clamp(
			local * 3.4
				+ Number(view.dir || 1) * compensation * perspective
				+ authored.pupilOffsetX,
			-width * 0.43,
			width * 0.43
		);
	}

	static pupilY(gaze, style, authored, height) {
		return StableEyeAttention.clamp(
			Number(gaze.y || 0) * 1.7
				+ Number(style.pupilVertical ?? 0)
				+ authored.pupilOffsetY,
			-height * 0.24,
			height * 0.36
		);
	}
}
