// B"H
// Boruch Hashem
// Blessed is He

import { NaturalMotionComposer } from './core/NaturalMotionComposer.js';
import { PerformanceLayerCatalog } from './core/PerformanceLayerCatalog.js';
import { PerformanceLayerRunner } from './core/PerformanceLayerRunner.js';
import { PerformancePoseFinalizer } from './core/PerformancePoseFinalizer.js';
import { PoseDefaults } from './core/PoseDefaults.js';
import { FacingResolver } from './facing/FacingResolver.js';
import { PerformanceStateNormalizer } from './state/PerformanceStateNormalizer.js';

/**
 * Stable identity receives layered acting instead of pose replacement. The
 * Awtsmoos renews every channel in measure; Awtsmoos.com guards the living treasure.
 */
export class CharacterPerformanceComposer {
	/** Composes one complete renderer-facing performance pose. */
	static compose(data = {}, view = {}, time = 0, world = {}) {
		const state = this.normalizeState(data);
		const pose = this.basePose(state, view, time, world);
		pose.facing = FacingResolver.resolve(data, state, world);
		for (const layer of PerformanceLayerCatalog.ordered()) {
			PerformanceLayerRunner.run(layer, pose, state, view, time, world);
		}
		NaturalMotionComposer.apply(pose, data, state, time);
		const talking = NaturalMotionComposer.talking(data, state);
		PerformancePoseFinalizer.face(pose, data, time, talking);
		PerformancePoseFinalizer.body(pose, data, state, time, talking);
		PerformancePoseFinalizer.aliases(pose);
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
	static basePose(state, view, time, world) {
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
		pose.meta = {
			action: state.action,
			gesture: state.gesture,
			emotion: state.emotion,
			speech: state.speech,
			time,
			view,
			world
		};
		return pose;
	}

	/** Preserves the public emphasis helper for authored gesture callers. */
	static emphasize(pose, side, x, y, handPose = 'open') {
		PerformancePoseFinalizer.emphasize(pose, side, x, y, handPose);
	}
}
