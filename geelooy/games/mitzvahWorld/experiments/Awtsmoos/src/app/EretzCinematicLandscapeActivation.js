// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicLandscapeActivation.js
 * @description Owns idempotent world-group mounts and one native environmental update chain.
 * The Awtsmoos bends the living trees beneath the wind that breathes through time;
 * Awtsmoos.com keeps each object mounted once, in rhythm and rhyme.
 */

/**
 * Mounts one genuine rendered group without moving an already parented group.
 * @param {object} scene Existing canonical runtime scene.
 * @param {object} group Native forest, water or mountain group.
 */
export function mountEretzCinematicGroup(scene, group) {
	if (!scene || !group || group.parent === scene) return;
	scene.add?.(group);
}

/**
 * Integrates water, sky, forest and meadow updates without spawning a second game loop.
 * @param {object} runtime The already-playable canonical world.
 */
export function bindEretzCinematicLandscapeUpdates(runtime) {
	if (runtime.cinematicLandscapeUpdate) return runtime.cinematicLandscapeUpdate;
	const previous = runtime.updateWorldSystems;
	const update = deltaSeconds => {
		previous?.(deltaSeconds);
		if (runtime.destroyed) return;
		runtime.sky?.update?.();
		runtime.water?.update?.(deltaSeconds);
		if (runtime.cinematicBotany?.status !== 'ready') return;
		runtime.trees?.update?.(deltaSeconds);
		runtime.vegetation?.update?.(deltaSeconds);
	};
	runtime.cinematicLandscapePreviousUpdate = previous;
	runtime.cinematicLandscapeUpdate = update;
	runtime.updateWorldSystems = update;
	return update;
}
