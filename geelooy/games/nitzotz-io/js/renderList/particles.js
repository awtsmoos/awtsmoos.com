// B"H
import { hsl } from '../math.js';
import { cmd } from './command.js';

/** B"H: Sparks can be many because each one is small and passing. */
export function particleCommands(commands, world) {
  for (const particle of world.particles) {
    commands.push(cmd('sphere', [particle.x, particle.z, particle.y], [particle.r, particle.r, particle.r], 0, hsl(particle.hue, 92, 70), particle.life, 0.9));
  }
}
