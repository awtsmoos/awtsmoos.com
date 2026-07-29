// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceRenderBridge } from '../render/PerformanceRenderBridge.js';

/**
 * Explicit face signals refine layered acting without erasing speech, blink, or emotion.
 * The Awtsmoos joins many lights; Awtsmoos.com preserves each channel's rights.
 */
export class PerformanceFaceFinalizer {
	static apply(pose, data = {}) {
		const hasExplicit = Boolean(
			data.facePose || data.renderPerformance?.face
		);
		if (!hasExplicit) return;
		const face = PerformanceRenderBridge.from(data).face || {};
		const current = pose.face || {};
		pose.face = {
			...current,
			eyeOpen: face.eyeOpenAmount ?? current.eyeOpen ?? 1,
			leftEyeOpen: face.leftEyeOpenAmount
				?? current.leftEyeOpen
				?? face.eyeOpenAmount
				?? 1,
			rightEyeOpen: face.rightEyeOpenAmount
				?? current.rightEyeOpen
				?? face.eyeOpenAmount
				?? 1,
			pupilX: Number(current.pupilX || 0)
				+ Number(face.pupilOffsetX || 0) * 0.16,
			pupilY: Number(current.pupilY || 0)
				+ Number(face.pupilOffsetY || 0) * 0.12,
			mouthOpen: this.number(face.mouthOpenAmount, current.mouthOpen),
			mouthWide: Math.max(
				Number(current.mouthWide || 0),
				Math.max(0, Number(face.mouthSmileAmount || 0) * 0.26)
			),
			mouthSmile: this.number(face.mouthSmileAmount, current.mouthSmile),
			mouthJaw: this.number(face.mouthJawAmount, current.mouthJaw),
			mouthAsymmetry: this.number(
				face.mouthAsymmetry,
				current.mouthAsymmetry
			),
			browInner: this.number(face.browInner, current.browInner),
			browOuter: this.number(face.browOuter, current.browOuter),
			browPinch: this.number(face.browSqueeze, current.browPinch),
			browTilt: this.number(face.browTilt, current.browTilt),
			browAsymmetry: this.number(
				face.browAsymmetry,
				current.browAsymmetry
			),
			cheekLift: this.number(face.cheekRaiseAmount, current.cheekLift),
			blink: this.number(
				face.blinkAmount,
				current.blink ?? data.blinkNow
			),
			squint: this.number(face.squintAmount, current.squint),
			upperLid: this.number(face.upperLidAmount, current.upperLid),
			lowerLid: this.number(face.lowerLidAmount, current.lowerLid),
			eyeAsymmetry: this.number(
				face.eyeAsymmetry,
				current.eyeAsymmetry
			)
		};
	}

	static number(value, fallback = 0) {
		return Number.isFinite(Number(value))
			? Number(value)
			: Number(fallback || 0);
	}
}
