// B"H
import { cmd, shadow } from './command.js';

/** B"H: The player portal marks home without becoming a wall. */
export function portalCommands(commands, player, time, pulse) {
  shadow(commands, player.x, player.y, player.z, player.r * 1.35, 0.28);
  commands.push(cmd('sphere', [player.x, player.z + player.h * 0.55, player.y], [player.r * 0.72, player.r * 0.72, player.r * 0.72], time, [0.72, 0.86, 1], 0.9, player.glow + 0.25));
  commands.push(cmd('ring', [player.x, player.z + player.h * 0.58, player.y], [player.r * 1.18, player.r * 1.18, player.r * 1.18], time * 2.4, [1, 0.85, 0.32], 0.62, pulse ? 0.8 : 0.18));
}
