// B"H
import { advanceSinks } from './absorption.js';

/** Animate sinking, embers, floating rewards, and temporary respawn silence. */
export function animateEffects(world, dt) {
	advanceSinks(world, dt);
	world.particles = world.particles.filter(particle => moveParticle(particle, dt));
	world.floaters = world.floaters.filter(floater => liftFloater(floater, dt));
}

function moveParticle(particle, dt) {
	particle.x += particle.vx * dt;
	particle.y += particle.vy * dt;
	particle.z += particle.vz * dt;
	particle.vz -= 270 * dt;
	particle.life -= dt;
	return particle.life > 0 && particle.z > -30;
}

function liftFloater(floater, dt) {
	floater.z += 54 * dt;
	floater.life -= dt;
	return floater.life > 0;
}
