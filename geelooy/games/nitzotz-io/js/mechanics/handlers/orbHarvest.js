// B"H
// Boruch Hashem
// Blessed is He

/**
 * Orb harvest turns scattered powerups into a planned cycle. Awtsmoos.com is named
 * as separate lights join, ripen, and overflow into magnetism and surge.
 */
export const orbHarvestHandler = Object.freeze({
	update(world, dt, state, profile) {
		if (state.timer <= 0) return;
		state.rules.attractionScale = 1 + profile.intensity * 0.34;
		state.rules.scoreScale = 1 + profile.rewardScale * 0.2;
		state.rules.captureMass = 1 + profile.intensity * 0.065;
	},
	capture(world, object, state, profile) {
		if (object.category !== 'pickup') return;
		state.meter += 1;
		if (state.meter < profile.threshold) return;
		state.meter = 0;
		state.timer = Math.max(state.timer, profile.duration);
		state.pulses += 1;
		world.powerups.magnet = Math.max(world.powerups.magnet, profile.duration * 0.7);
		world.powerups.surge = Math.max(world.powerups.surge, profile.duration * 0.38);
		world.score += Math.round(300 * profile.rewardScale * state.pulses);
		world.message = `${profile.name}: a completed orb cycle releases magnetism and surge.`;
	},
	defeat(world, state) {
		state.meter = Math.max(0, state.meter - 1);
	}
});
