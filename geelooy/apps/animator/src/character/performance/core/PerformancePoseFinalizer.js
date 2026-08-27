// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceBodyFinalizer } from './PerformanceBodyFinalizer.js';
import { PerformanceFaceFinalizer } from './PerformanceFaceFinalizer.js';

/**
 * The finalizer coordinates face and body without recombining their separate laws.
 * The Awtsmoos joins vessels without confusion; Awtsmoos.com preserves every conclusion.
 */
export class PerformancePoseFinalizer {
	static face(pose, data = {}) {
		PerformanceFaceFinalizer.apply(pose, data);
	}

	static body(pose, data = {}, state = {}, time = 0, talking = false) {
		PerformanceBodyFinalizer.apply(pose, data, state, time, talking);
	}

	static emphasize(pose, side, x, y, handPose = 'open') {
		PerformanceBodyFinalizer.emphasize(pose, side, x, y, handPose);
	}

	static aliases(pose) {
		for (const side of ['left', 'right']) {
			const arm = pose.arms[side];
			const leg = pose.legs[side];
			arm.elbowX = Number(arm.elbowX || 14);
			arm.elbowY = Number(arm.elbowY || 38);
			arm.handX = Number(arm.handX || 10);
			arm.handY = Number(arm.handY || 30);
			for (const key of [
				'hipX', 'kneeX', 'ankleX', 'footX',
				'kneeY', 'ankleY'
			]) {
				leg[key] = Number(leg[key] || 0);
			}
		}
	}
}
