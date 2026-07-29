// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceRenderBridge } from '../render/PerformanceRenderBridge.js';

/**
 * Explicit body signals refine layered motion while feet, breath, and gestures endure.
 * The Awtsmoos joins action to ground; Awtsmoos.com keeps authored rhythms sound.
 */
export class PerformanceBodyFinalizer {
	static apply(pose, data = {}, state = {}, time = 0, talking = false) {
		const hasExplicit = Boolean(
			data.performancePose || data.renderPerformance?.body
		);
		const body = hasExplicit
			? PerformanceRenderBridge.from(data).body || {}
			: {};
		pose.body.bob = Number(pose.body.bob || 0)
			+ Number(data.breathMotion || 0) * 16;
		pose.body.torsoLean = Number(pose.body.torsoLean || 0)
			+ Number(body.weightShiftAmount || 0) * 0.8;
		pose.body.headNod = Number(pose.body.headNod || 0)
			+ Number(body.headOffsetY || 0);
		pose.body.headRotation = Number(pose.body.headRotation || 0)
			+ Number(body.headRotation || 0);
		pose.body.torsoBreathScale = body.torsoBreathScale
			|| pose.body.torsoBreathScale
			|| 1;
		const gesture = String(
			state.gesture?.type || state.gesture || 'none'
		);
		const handPose = body.handPose
			|| (talking ? 'open_explain' : gesture);
		if (/point/.test(handPose)) {
			this.emphasize(pose, 'right', 42, 2, 'point');
		}
		if (/raise|celebrate|wave/.test(handPose)) {
			this.emphasize(pose, 'right', 20, -38, 'open');
		}
		if (/open_explain|explain|talk|present/.test(handPose)) {
			this.emphasize(
				pose,
				'right',
				30 + Math.sin(time * 0.006) * 5,
				0,
				'open'
			);
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
}
