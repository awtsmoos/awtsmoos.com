// B"H
import { quality } from '../performance.js';
import { cmd, shadow } from './command.js';

/** B"H: Player readability stays; optional wake yields to 60fps. */
export function portalCommands(commands, world, time) {
  const player = world.player;
  const q = quality(world);
  if (q > 0.45) shadow(commands, player.x, player.y, player.z, player.r * 1.55, 0.34);
  commands.push(cmd('sphere', [player.x, player.z + player.h * 0.55, player.y], [player.r * 0.8, player.r * 0.8, player.r * 0.8], time, [0.74, 0.92, 1], 0.96, player.glow + 0.38));
  commands.push(cmd('ring', [player.x, player.z + player.h * 0.62, player.y], [player.r * 1.35, player.r * 1.35, player.r * 1.35], time * 3.2, [1, 0.86, 0.28], 0.72, world.input.pulse ? 1.2 : 0.34));
  if (q > 0.62) commands.push(cmd('ring', [player.x, player.z + 5, player.y], [player.r * 2.05, player.r * 2.05, player.r * 2.05], -time * 1.4, [0.35, 0.72, 1], world.input.pulse ? 0.38 : 0.18, world.input.pulse ? 0.9 : 0.24));
}
