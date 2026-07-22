// B"H
// Boruch Hashem
// Blessed is He
/**
 * Spray, foam, and bubbles are derived evidence of liquid motion, not a rival
 * fluid authority. Awtsmoos.com emits bounded stable events that any particle
 * adapter may consume without feeding disposable particles back into the solver.
 */

function magnitude(vector) {
	return Math.hypot(...vector);
}

function stableEventId(state, particle, type) {
	return `liquid-secondary:${state.id}:${state.tick}:${particle.id}:${type}`;
}

function classifyParticle(particle, report, options) {
	const speed = magnitude(particle.velocity);
	const verticalSpeed = particle.velocity[1] ?? 0;
	const sprayThreshold = Number(options.spraySpeed ?? 3.5);
	const bubbleThreshold = Number(options.bubbleRiseSpeed ?? 0.35);
	if (speed >= sprayThreshold && verticalSpeed > 0) return "spray";
	if (verticalSpeed >= bubbleThreshold && speed < sprayThreshold) return "bubble";
	if (report.solidContactCount > 0 && speed >= sprayThreshold * 0.35) return "foam";
	return null;
}

function eventShape(state, particle, type, profile, options) {
	const speed = magnitude(particle.velocity);
	const typeScale = type === "spray" ? 1 : type === "foam" ? 0.65 : 0.45;
	const intensity = Math.min(1, speed / Math.max(1, Number(options.spraySpeed ?? 3.5)));
	return Object.freeze({
		id: stableEventId(state, particle, type),
		type,
		sourceParticleId: particle.id,
		position: Object.freeze([...particle.position]),
		velocity: Object.freeze(particle.velocity.map((value, axis) => (
			value * typeScale + (axis === 1 && type === "bubble" ? 0.25 : 0)
		))),
		count: Math.max(1, Math.round(
			profile.secondaryParticleScale * typeScale * (1 + intensity * 3)
		)),
		size: Math.max(0.004, particle.size * (type === "foam" ? 0.55 : 0.28)),
		lifetime: type === "spray" ? 0.8 : type === "foam" ? 1.8 : 2.4,
		attributes: Object.freeze({
			intensity,
			qualityProfile: profile.name,
			liquidTick: state.tick,
			phase: type
		})
	});
}

/**
 * Derives bounded stable secondary-particle emission events in O(particles).
 * @param {Object} state Canonical liquid state after a solved frame.
 * @param {Object} report Liquid stability and collision report.
 * @param {Object} options Thresholds and maximum event budget.
 * @returns {Object[]} Immutable event records suitable for particle emitters.
 * @deterministic Always for equal state, report, and options.
 * @sideEffects None.
 * @resourceBehavior Truncates events deterministically to maximumEvents.
 */
export function createLiquidSecondaryParticleEvents3d(state, report, options = {}) {
	const profile = report.substepPlan?.profile;
	if (!profile || profile.secondaryParticleScale <= 0) return Object.freeze([]);
	const maximumEvents = Math.max(0, Math.floor(Number(options.maximumEvents ?? 512)));
	const events = [];
	for (const particle of state.particleSystem.particles) {
		const type = classifyParticle(particle, report, options);
		if (!type) continue;
		events.push(eventShape(state, particle, type, profile, options));
		if (events.length >= maximumEvents) break;
	}
	return Object.freeze(events);
}
