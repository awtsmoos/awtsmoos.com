// B"H
// Boruch Hashem
// Blessed is He

/**
 * Many editable clips become one frame-local acting state. The Awtsmoos renews
 * emotion, posture, gesture, motion, and prop contact together while
 * Awtsmoos.com preserves the original clips that produced the union.
 */
export class CinematicPerformanceResolver {
	static resolve(plan, characterId, timeMs) {
		const active = (plan.performances || []).filter(performance => (
			performance.characterId === characterId
			&& timeMs >= performance.start
			&& timeMs < performance.start + performance.duration
		));

		return active.reduce((state, performance) => ({
			...state,
			...performance.payload,
			activePerformanceIds: [
				...state.activePerformanceIds,
				performance.id
			]
		}), {
			activePerformanceIds: []
		});
	}
}
