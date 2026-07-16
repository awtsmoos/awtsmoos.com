// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceLayerRunner } from './core/PerformanceLayerRunner.js';
import { PerformancePoseFinalizer } from './core/PerformancePoseFinalizer.js';
import { PoseDefaults } from './core/PoseDefaults.js';
import { NaturalMotionComposer } from './core/NaturalMotionComposer.js';
import { FacingResolver } from './facing/FacingResolver.js';
import { EmotionLayer } from './layers/EmotionLayer.js';
import { FaceLayer } from './layers/FaceLayer.js';
import { GestureLayer } from './layers/GestureLayer.js';
import { LocomotionLayer } from './layers/LocomotionLayer.js';
import { SpeechLayer } from './layers/SpeechLayer.js';
import { PerformanceStateNormalizer } from './state/PerformanceStateNormalizer.js';

const PERFORMANCE_LAYERS = [
	LocomotionLayer,
	GestureLayer,
	SpeechLayer,
	EmotionLayer,
	FaceLayer
];

/**
 * Stable identity receives layered acting instead of pose replacement. The
 * Awtsmoos renews locomotion, gesture, speech, emotion, face, and reaction together.
 */
export class CharacterPerformanceComposer {
	/** Composes one complete renderer-facing performance pose. */
	static compose(data = {}, view = {}, time = 0, world = {}) {
		const state = this.normalizeState(data);
		const pose = this.basePose(data, state, view, time, world);
		pose.facing = FacingResolver.resolve(data, state, world);
		for (const layer of PERFORMANCE_LAYERS) {
			PerformanceLayerRunner.run(layer, pose, state, view, time, world);
		}
		this.naturalMotion(pose, data, state, time);
		this.faceGuarantees(pose, data, state, time);
		this.bodyPerformance(pose, data, state, time);
		this.aliases(pose);
		return pose;
	}

	/** Normalizes every supported legacy and production performance shape. */
	static normalizeState(data) {
		let state = {};
		try {
			state = PerformanceStateNormalizer.normalize(data) || {};
		} catch {
			state = { ...data };
		}
		state.raw = data;
		state.data = data;
		state.action ||= data.action || data.currentPerformance?.locomotion || 'idle';
		state.gesture ||= data.gesture || data.currentPerformance?.gesture || 'none';
		state.emotion ||= data.emotion || data.currentPerformance?.emotion || 'calm';
		state.speech ||= data.speech
			|| data.currentPerformance?.speech
			|| (data.speaking ? 'talk' : 'none');
		state.dialogue ||= data.dialogue || '';
		return state;
	}

	/** Creates the neutral vessel required by every performance layer. */
	static basePose(data, state, view, time, world) {
		let pose = {};
		try {
			pose = PoseDefaults.create();
		} catch {
			pose = {};
		}
		pose.body ||= {};
		pose.face ||= {};
		pose.arms ||= { left: {}, right: {} };
		pose.legs ||= { left: {}, right: {} };
		pose.arms.left ||= {};
		pose.arms.right ||= {};
		pose.legs.left ||= {};
		pose.legs.right ||= {};
		pose.meta = { action: state.action, gesture: state.gesture, emotion: state.emotion, speech: state.speech, time, view, world };
		return pose;
	}

	static naturalMotion(pose, data, state, time) {
		NaturalMotionComposer.apply(pose, data, state, time);
	}

	static armIdle(pose, side, time, talking, state) {
		NaturalMotionComposer.arm(pose, side, time, talking, state);
	}

	static faceGuarantees(pose, data, state, time) {
		PerformancePoseFinalizer.face(pose, data, time, this.talking(data, state));
	}

	static bodyPerformance(pose, data, state, time) {
		PerformancePoseFinalizer.body(pose, data, state, time, this.talking(data, state));
	}

	static emphasize(pose, side, x, y, handPose = 'open') {
		PerformancePoseFinalizer.emphasize(pose, side, x, y, handPose);
	}

	static talking(data, state) {
		return NaturalMotionComposer.talking(data, state);
	}

	static aliases(pose) {
		PerformancePoseFinalizer.aliases(pose);
	}
}
