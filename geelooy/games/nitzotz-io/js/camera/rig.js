// B"H
import { clamp, mix } from '../math.js';
import { cameraConfig } from './config.js';
import { clearCameraEye } from './obstacles.js';

/**
 * B"H
 * The orbit no longer dives into buildings; it circles with patience and air.
 */
export function updateCamera(world, dt) {
  const c = world.camera;
  const p = world.player;
  const cfg = cameraConfig(world.save.perf);
  if (world.won) c.victory += dt;
  const drift = world.won ? c.victory * 0.45 : inputDrift(world);
  const distance = clamp(cfg.base + p.r * cfg.grow, cfg.min, cfg.max);
  c.angle = mix(c.angle, drift, dt * 1.65);
  c.distance = mix(c.distance, distance, dt * 1.6);
  const raw = desiredEye(c, p, cfg, world.input.pulse > 0);
  const eye = clearCameraEye(raw, p, world.level.objects, cfg);
  c.x = mix(c.x, eye.x, dt * cfg.lerp);
  c.y = mix(c.y, eye.y, dt * cfg.lerp);
  c.z = mix(c.z, eye.z, dt * (cfg.lerp * 0.75));
  c.targetZ = mix(c.targetZ ?? p.z + p.h * 0.6, p.z + p.h * 0.58, dt * 3);
  c.shake = Math.max(0, c.shake - dt);
}

function inputDrift(world) {
  const x = world.input.x;
  const y = world.input.y || -0.001;
  return Math.atan2(x, -y) * 0.28;
}

function desiredEye(c, p, cfg, pulsing) {
  const lift = cfg.height + p.r * cfg.lift + (pulsing ? 85 : 0);
  return {
    x: p.x - Math.sin(c.angle) * c.distance,
    y: p.y - Math.cos(c.angle) * c.distance,
    z: p.z + lift
  };
}
