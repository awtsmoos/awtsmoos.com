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
	/** Resolves evaluated and explicitly authored eyelid channels for one eye. */
	static performance(data, mood, side, blink) {
		const pose = data._stablePose?.face || {};
		const face = data.renderPerformance?.face || {};
		const sidePoseKey = side < 0 ? 'leftEyeOpen' : 'rightEyeOpen';
		const sideFaceKey = side < 0 ? 'leftEyeOpenAmount' : 'rightEyeOpenAmount';
		const baseOpen = Number(
			pose[sidePoseKey]
			?? pose.eyeOpen
			?? face[sideFaceKey]
			?? face.eyeOpenAmount
			?? 1
		);
		const blinkAmount = Math.max(
			Number(blink || 0),
			Number(pose.blink ?? face.blinkAmount ?? 0)
		);
		const blinkOpen = 1 - StableEyeAttention.clamp(blinkAmount, 0, 1);
		const evaluatedOpen = Math.min(baseOpen, blinkOpen);
		const asymmetry = Number(mood.eyeAsymmetry ?? face.eyeAsymmetry ?? 0) * side;
		const squint = Number(mood.squint ?? pose.squint ?? face.squintAmount ?? 0);
		return {
			lid: StableEyeAttention.clamp(
				evaluatedOpen + asymmetry - squint,
				0.08,
				1.2
			),
			upperLid: Number(mood.upperLid ?? pose.upperLid ?? face.upperLidAmount ?? 0),
			lowerLid: Number(mood.lowerLid ?? pose.lowerLid ?? face.lowerLidAmount ?? 0)
		};
	}

	/** Resolves eye width while protecting readable separation at small scales. */
	static width(style, authored, perspective, centerDistance) {
		const requested = Number(style.radiusX || 9.4)
			* perspective
			* Number(style.widthScale || 1)
			* authored.widthScale;
		return Math.min(requested, centerDistance * Number(style.separationRatio || 0.82));
	}

	/** Resolves eye height from anatomy and evaluated lid openness. */
	static height(style, authored, perspective, width, performance) {
		const requested = Number(style.radiusY || 8.2)
			* perspective
			* Number(style.heightScale || 1)
			* authored.heightScale
			* performance.lid;
		return Math.max(1.1, Math.min(requested, width * Number(style.maxAspect || 1.08)));
	}

	/** Resolves bounded horizontal pupil travel in local view space. */
	static pupilX(gaze, view, side, authored, width, perspective, style = {}) {
		const compensation = Number(style.viewPupilCompensation ?? 0);
		const local = StableViewSpaceGaze.localX(gaze, view, side, style);
		return StableEyeAttention.clamp(
			local * 3.4 + Number(view.dir || 1) * compensation * perspective
				+ authored.pupilOffsetX,
			-width * 0.43,
			width * 0.43
		);
	}

	/** Resolves bounded vertical pupil travel. */
	static pupilY(gaze, style, authored, height) {
		return StableEyeAttention.clamp(
			Number(gaze.y || 0) * 1.7 + Number(style.pupilVertical ?? 0)
				+ authored.pupilOffsetY,
			-height * 0.24,
			height * 0.36
		);
	}
}
