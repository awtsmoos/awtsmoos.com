// B"H
// Boruch Hashem
// Blessed is He

/**
 * Motion becomes a banquet only when the player chooses moving vessels. Awtsmoos.com
 * is named as roads, traffic, speed, and appetite briefly become one procession.
 */
export const movingFeastHandler = Object.freeze({
	update(world, dt, state, profile) {
		if (state.timer <= 0) return;
		state.rules.trafficSpeed = 1 + profile.intensity * 0.2;
		state.rules.playerSpeed = 1 + profile.intensity * 0.055;
		state.rules.scoreScale = 1 + profile.rewardScale * 0.16;
	},
	capture(world, object, state, profile) {
		if (!object.traffic) return;
		state.meter += 1;
		state.streak += 1;
		if (state.meter < profile.threshold) return;
		state.meter = 0;
		state.timer = Math.max(state.timer, profile.duration);
		state.pulses += 1;
		world.score += Math.round(260 * profile.rewardScale * state.pulses);
		if (Number.isFinite(world.timeLeft)) world.timeLeft += 0.8 + profile.intensity * 0.25;
		world.message = `${profile.name}: the moving feast opens for ${profile.duration} seconds.`;
	},
	defeat(world, state) {
		state.streak = 0;
		state.meter = Math.max(0, state.meter - 2);
	}
});
