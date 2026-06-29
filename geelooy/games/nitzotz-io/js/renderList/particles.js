// B"H
import { hsl } from '../math.js';
import { quality } from '../performance.js';
import { cmd } from './command.js';

/** B"H: Embers become simpler before they become slow. */
export function particleCommands(commands, world) {
  const q = quality(world);
  const max = Math.floor(90 * q);
  for (const p of world.particles.slice(0, max)) {
    const glow = 0.65 + p.life * 0.45;
    commands.push(cmd('sphere', [p.x, p.z, p.y], [p.r, p.r, p.r], 0, hsl(p.hue, 96, 72), Math.min(1, p.life), glow));
    if (q > 0.78 && p.life > 0.45) commands.push(cmd('star', [p.x - p.vx * 0.025, p.z - p.vz * 0.018, p.y - p.vy * 0.025], [p.r * 1.7, p.r * 0.7, p.r * 1.7], p.life * 9, hsl(p.hue + 28, 95, 62), p.life * 0.32, glow));
  }
}
