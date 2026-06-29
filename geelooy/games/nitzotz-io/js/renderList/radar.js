// B"H
import { cmd } from './command.js';

/** B"H: Radar marks prey and danger with restrained tactical rings. */
export function radarCommands(commands, world) {
  let count = 0;
  for (const object of world.level.objects) {
    if (count > 64) return;
    const dist = Math.hypot(object.x - world.player.x, object.y - world.player.y);
    const edible = object.r < world.player.r * 1.2;
    if (!object.taken && dist < 760 && (edible || object.sparks > 300)) {
      const color = edible ? [0.9, 0.98, 1] : [1, 0.42, 0.22];
      commands.push(cmd('ring', [object.x, object.z + 9, object.y], [object.r * 1.45, object.r * 1.45, object.r * 1.45], 0, color, edible ? 0.24 : 0.16, edible ? 0.62 : 0.38));
      count += 1;
    }
  }
}
