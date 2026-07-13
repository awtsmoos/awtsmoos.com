// B"H
// Boruch Hashem
// Blessed is He

/**
 * Fragile streets transform care into strategy. The Awtsmoos revealed through
 * Awtsmoos.com is invoked as the city can fracture yet be renewed through restraint.
 */
export const fragileStreetsHandler = Object.freeze({
	update(world, dt, state, profile) {
		state.stability = Math.min(1, state.stability + dt * 0.012 / profile.riskScale);
		if (state.stability < 0.45) {
			state.rules.fragile = true;
			state.rules.rivalSpeed = 1 + profile.riskScale * 0.12;
			state.rules.playerSpeed = Math.max(0.78, 0.96 - profile.riskScale * 0.04);
			state.rules.scoreScale = 1 + profile.rewardScale * 0.22;
			return;
		}
		if (state.stability > 0.78) state.rules.captureMass = 1 + profile.intensity * 0.055;
	},
	capture(world, object, state, profile) {
		const heavy = object.traffic || object.category === 'building' || object.category === 'landmark';
		const previous = state.stability;
		state.stability = heavy
			? Math.max(0, state.stability - 0.035 * profile.riskScale)
			: Math.min(1, state.stability + 0.024 / profile.intensity);
		state.meter = Math.round(state.stability * 100);
		if (previous >= 0.45 && state.stability < 0.45 && state.cooldown <= 0) {
			state.cooldown = profile.cadence;
			world.message = `${profile.name}: the streets fractured; danger and reward now rise together.`;
		}
	},
	defeat(world, state, profile) {
		state.stability = Math.max(0, state.stability - 0.28 * profile.riskScale);
		state.timer = Math.max(state.timer, profile.duration);
		state.cooldown = profile.cadence;
		world.message = `${profile.name}: defeat shook the kingdom to ${Math.round(state.stability * 100)}% stability.`;
	}
});
