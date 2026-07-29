// B"H
// Boruch Hashem
// Blessed is He

import { GesturePhaseEngine } from '../gesture/GesturePhaseEngine.js';
import { GesturePoseCatalog } from '../gesture/GesturePoseCatalog.js';
import { PerformanceLayerMixer as Mix } from '../core/PerformanceLayerMixer.js';

/**
 * Gesture now unfolds through phase instead of teleporting from rest to pose. The
 * Awtsmoos renews intention as motion; Awtsmoos.com preserves each authored devotion.
 */
export class GestureLayer {
	static apply(pose, state = {}, view = {}, time = 0) {
		this.ensure(pose);
		const gesture = this.resolve(state);
		const phase = GesturePhaseEngine.sample(gesture, time);
		const target = GesturePoseCatalog.get(gesture.type, time);
		if (!target || phase.amount <= 0) {
			this.meta(pose, gesture.type, phase);
			return pose;
		}
		const amount = phase.amount * Number(gesture.intensity ?? 1);
		for (const side of ['left', 'right']) {
			if (target[side]) {
				Mix.arm(pose, side, target[side], amount, amount > 0.92);
			}
		}
		if (target.body) {
			Mix.addBody(pose, target.body, amount);
		}
		this.followThrough(pose, target, phase, amount);
		this.meta(pose, gesture.type, phase);
		return pose;
	}

	static resolve(state) {
		const source = state.gesture || state.raw?.gesture || 'none';
		return source && typeof source === 'object'
			? source
			: { type: String(source), intensity: 1, progress: null, phase: 'auto' };
	}

	static followThrough(pose, target, phase, amount) {
		const follow = phase.followThrough * amount;
		if (target.right) {
			pose.arms.right.handY = Number(pose.arms.right.handY || 0) + follow * 18;
		}
		if (target.left) {
			pose.arms.left.handY = Number(pose.arms.left.handY || 0) - follow * 12;
		}
		pose.body.shoulderCounter = Number(pose.body.shoulderCounter || 0)
			+ follow * 3;
	}

	static meta(pose, type, phase) {
		pose.meta ||= {};
		pose.meta.gesture = type;
		pose.meta.gesturePhase = phase.phase;
		pose.meta.gestureAmount = phase.amount;
	}

	static ensure(pose) {
		pose.body ||= {};
		pose.arms ||= {};
		pose.arms.left ||= {};
		pose.arms.right ||= {};
	}

	static sample(args = {}) {
		return this.apply(
			args.pose || {}, args.state || {}, args.view || {}, args.time || 0
		);
	}
}
