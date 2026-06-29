// B"H
import { cmd } from './command.js';

/** B"H: Radar whispers; it no longer adds a second city of rings. */
export function radarCommands(commands, world) {
  let count = 0;
  for (const object of world.level.objects) {
    if (count > 32) return;
    const close = Math.hypot(object.x - world.player.x, object.y - world.player.y) < 520;
    if (!object.taken && object.r < world.player.r * 1.2 && close) {
      commands.push(cmd('ring', [object.x, object.z + 8, object.y], [object.r * 1.35, object.r * 1.35, object.r * 1.35], 0, [0.9, 0.95, 1], 0.2, 0.5));
      count += 1;
    }
  }
}
