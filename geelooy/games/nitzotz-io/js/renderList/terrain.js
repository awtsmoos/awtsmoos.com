// B"H
import { hsl, heightAt } from '../math.js';
import { cmd } from './command.js';

/** B"H: Terrain is sparse now, so the path is visible between sparks. */
export function terrainCommands(commands, world) {
  commands.push(cmd('plane', [0, -18, 0], [world.level.bounds, 1, world.level.bounds], 0, hsl(world.level.hue, 45, 13), 1, 0));
  for (let x = -1; x <= 1; x += 1) for (let y = -1; y <= 1; y += 1) {
    const px = world.player.x + x * 520;
    const py = world.player.y + y * 520;
    const z = heightAt(px, py, world.level.worldIndex);
    commands.push(cmd('disc', [px, z - 9, py], [250, 1, 250], 0, hsl(world.level.hue + 18 * x + 12 * y, 55, 18), 0.14, 0));
  }
}
