// B"H
// Boruch Hashem
// Blessed is He
/** Derived particle systems make foam, spray, bubbles, and mist independently renderable. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createParticleSystem } from "../particles/createParticleSystem.js";
import { classifyLiquidSecondaryParticles3d } from "./classifyLiquidSecondaryParticles3d.js";

const STYLE = Object.freeze({
	spray: { lifetime: 0.65, size: 0.035, buoyancy: 0 },
	foam: { lifetime: 2.5, size: 0.06, buoyancy: 0.15 },
	bubble: { lifetime: 1.8, size: 0.045, buoyancy: 0.8 },
	mist: { lifetime: 1.2, size: 0.025, buoyancy: 0.3 }
});

function derivedParticle(metric, role, index, tick) {
	const style = STYLE[role];
	return {
		id: `${metric.particle.id}:${role}:${tick}:${index}`,
		position: metric.particle.position,
		velocity: metric.particle.velocity,
		age: 0,
		lifetime: style.lifetime,
		mass: role === "mist" ? 0.02 : 0.1,
		size: style.size * (1 + Math.min(2, metric.turbulence)),
		attributes: {
			role,
			buoyancy: style.buoyancy,
			sourceParticleId: metric.particle.id,
			sourceTick: tick,
			turbulence: metric.turbulence,
			surfaceHeight: metric.height
		}
	};
}

/** Creates four stable systems without consuming primary liquid particles. */
export function createLiquidSecondaryParticleSystems3d(state, options = {}) {
	const classification = classifyLiquidSecondaryParticles3d(state, options);
	const systems = {};
	for (const [role, metrics] of Object.entries(classification.groups)) {
		const particles = metrics.map(
			(metric, index) => derivedParticle(metric, role, index, state.tick)
		);
		systems[role] = createParticleSystem({
			id: createStableId(`liquid.${role}`, { stateId: state.id, tick: state.tick }),
			seed: state.particleSystem.seed,
			capacity: Math.max(1, particles.length),
			particles,
			metadata: { role, sourceLiquidStateId: state.id, sourceTick: state.tick }
		});
	}
	return Object.freeze({ systems: Object.freeze(systems), classification });
}
