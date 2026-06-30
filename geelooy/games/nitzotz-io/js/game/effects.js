// B"H
import { addBurst } from '../state.js';
import { spiralToward } from '../engine/physics.js';

/** Animate absorption spirals, burst particles, and floating words. */
export function animateEffects(world, dt) {
  world.absorbers = world.absorbers.filter(object => absorbSpiral(world, object, dt));
  world.particles = world.particles.filter(particle => moveParticle(particle, dt));
  world.floaters = world.floaters.filter(floater => liftFloater(floater, dt));
}

function absorbSpiral(world, object, dt) {
  const alive = spiralToward(object, world.player, dt);
  if (!alive) addBurst(world, object);
  return alive;
}

function moveParticle(particle, dt) {
  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;
  particle.z += particle.vz * dt;
  particle.vz -= 270 * dt;
  particle.life -= dt;
  return particle.life > 0 && particle.z > 0;
}

function liftFloater(floater, dt) {
  floater.z += 54 * dt;
  floater.life -= dt;
  return floater.life > 0;
}
