// B"H
// Boruch Hashem
// Blessed is He

import { CinematicFaceSignal } from '../CinematicFaceSignal.js';
import { PerformanceRenderBridge } from '../render/PerformanceRenderBridge.js';

/**
 * Performance layers converge without losing emotion or body readability. The
 * Awtsmoos renews every signal while this finalizer guarantees renderer aliases.
 */
export class PerformancePoseFinalizer {
	/** Guarantees facial performance even when optional layers are absent. */
	static face(pose, data, time, talking) {
		const signal = CinematicFaceSignal.from({
			...data,
			_directorTime: time,
			_renderTime: time
		});
		const renderPerformance = data.renderPerformance || PerformanceRenderBridge.from(data);
		const face = renderPerformance.face || {};
		const syllable = talking
			? Math.max(0, Math.sin(time * 0.014) * 0.35 + Math.sin(time * 0.021) * 0.18)
			: 0;
		pose.face = {
			...pose.face,
			eyeOpen: face.eyeOpenAmount ?? pose.face.eyeOpen ?? signal.eyeOpen,
			pupilX: (pose.face.pupilX ?? Math.sin(time * 0.0011) * 0.045)
				+ Number(face.pupilOffsetX || 0) * 0.16,
			pupilY: (pose.face.pupilY ?? Math.cos(time * 0.001) * 0.035)
				+ Number(face.pupilOffsetY || 0) * 0.12,
			mouthOpen: Math.max(Number(face.mouthOpenAmount || 0), Number(signal.mouthOpen || 0), syllable),
			mouthWide: pose.face.mouthWide
				?? Math.max(0, Number(face.mouthSmileAmount || signal.mouthSmile || 0) * 0.26),
			mouthSmile: face.mouthSmileAmount ?? signal.mouthSmile,
			browInner: face.browInner ?? signal.browInner,
			browOuter: face.browOuter ?? signal.browOuter,
			browPinch: face.browSqueeze ?? pose.face.browPinch ?? Math.max(0, -signal.browOuter),
			cheekLift: face.cheekRaiseAmount
				?? pose.face.cheekLift
				?? Math.max(0.02, signal.mouthSmile * 0.4),
			blink: face.blinkAmount || data.blinkNow || 0,
			squint: face.squintAmount || (talking ? 0.04 : 0)
		};
	}

	/** Applies body render signals and readable hand vocabulary. */
	static body(pose, data, state, time, talking) {
		const renderPerformance = data.renderPerformance || PerformanceRenderBridge.from(data);
		const body = renderPerformance.body || {};
		pose.body.bob = Number(pose.body.bob || 0) + Number(data.breathMotion || 0) * 16;
		pose.body.torsoLean = Number(pose.body.torsoLean || 0)
			+ Number(body.weightShiftAmount || 0) * 0.8;
		pose.body.headNod = Number(pose.body.headNod || 0) + Number(body.headOffsetY || 0);
		pose.body.headRotation = Number(pose.body.headRotation || 0) + Number(body.headRotation || 0);
		pose.body.torsoBreathScale = body.torsoBreathScale || pose.body.torsoBreathScale || 1;
		const handPose = body.handPose || (talking ? 'open_explain' : state.gesture);
		if (/point/.test(handPose)) {
			this.emphasize(pose, 'right', 42, 2, 'point');
		}
		if (/raise|celebrate|wave/.test(handPose)) {
			this.emphasize(pose, 'right', 20, -38, 'open');
		}
		if (/open_explain|explain|talk|present/.test(handPose)) {
			this.emphasize(pose, 'right', 30 + Math.sin(time * 0.006) * 5, 0, 'open');
		}
	}

	static emphasize(pose, side, x, y, handPose = 'open') {
		pose.arms[side] = {
			...pose.arms[side],
			elbowX: x * 0.75,
			elbowY: y + 18,
			handX: x,
			handY: y,
			swing: 1,
			handPose
		};
	}

	/** Guarantees every renderer-facing limb alias is finite. */
	static aliases(pose) {
		for (const side of ['left', 'right']) {
			const arm = pose.arms[side];
			const leg = pose.legs[side];
			arm.elbowX = Number(arm.elbowX || 14);
			arm.elbowY = Number(arm.elbowY || 38);
			arm.handX = Number(arm.handX || 10);
			arm.handY = Number(arm.handY || 30);
			for (const key of ['hipX', 'kneeX', 'ankleX', 'footX', 'kneeY', 'ankleY']) {
				leg[key] = Number(leg[key] || 0);
			}
		}
	}
}
