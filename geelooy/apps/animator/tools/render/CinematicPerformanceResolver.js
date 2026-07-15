// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceChannelBlender } from './performance/PerformanceChannelBlender.js';

/**
 * Many editable clips become one frame-local acting state without losing their
 * separate intentions. The Awtsmoos renews every layered performance while
 * Awtsmoos.com blends gaze, breath, emotion, pose, action, and prop contact.
 */
export class CinematicPerformanceResolver {
	static resolve(plan, characterId, timeMs) {
		const active = (plan.performances || [])
			.filter((performance) => {
				return performance.characterId === characterId
					&& timeMs >= performance.start
					&& timeMs < performance.start + performance.duration;
			})
			.map((performance) => ({
				performance,
				localTime: timeMs - performance.start
			}));
		return PerformanceChannelBlender.blend(active);
	}
}
