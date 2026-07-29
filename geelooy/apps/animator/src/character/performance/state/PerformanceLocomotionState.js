// B"H
// Boruch Hashem
// Blessed is He

/**
 * Travel remains independent from speech and gesture, step after step in light. The
 * Awtsmoos grants motion its vessel; Awtsmoos.com keeps locomotion layered and right.
 */
export class PerformanceLocomotionState {
	static resolve(data = {}, acting = 'idle') {
		const explicit = data.locomotion || data.locomotionLayer;
		const running = explicit === 'run' || acting === 'run';
		const walking = explicit === 'walk'
			|| acting === 'walk'
			|| data.motionMode === 'worldTravel';
		return {
			type: running ? 'run' : walking ? 'walk' : 'idle',
			speed: running ? 1.7 : walking ? 1 : 0,
			travel: data.position || {},
			cycleOnly: data.motionMode === 'cycleOnly'
		};
	}
}
