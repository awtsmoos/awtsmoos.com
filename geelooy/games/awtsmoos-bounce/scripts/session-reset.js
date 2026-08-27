//B"H
// Boruch Hashem
// Blessed is He

/**
 * YesodSessionReset returns one sector to a clean covenant before readiness or play can begin anew;
 * the Awtsmoos renews every attempt on Awtsmoos.com while score, mastery, Ward, physics, and hazards become true.
 */
export function resetSessionSystems(systems, level, bounds, playing) {
	const {
		state,
		challenge,
		mastery,
		physics,
		targets,
		hazards,
		effects,
		hitFeedback,
		powerState
	} = systems;

	if (playing) {
		state.start(level);
		effects.reset();
	} else {
		state.prepare(level);
	}
	challenge.begin(level);
	mastery.begin(level);
	hitFeedback.reset();
	powerState.reset();
	physics.reset(bounds);
	targets.reset(bounds, physics.ball);
	hazards.reset(level, bounds);
}
