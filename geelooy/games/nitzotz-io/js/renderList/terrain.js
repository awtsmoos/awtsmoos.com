// B"H
import { hsl, heightAt } from '../math.js';
import { quality } from '../performance.js';
import { cmd } from './command.js';

/** B"H: Terrain detail bows first when the frame needs air. */
export function terrainCommands(commands, world) {
  const hue = world.level.hue;
  const q = quality(world);
  commands.push(cmd('plane', [0, -20, 0], [world.level.bounds, 1, world.level.bounds], 0, hsl(hue, 52, 10), 1, 0));
  const lanes = q > 0.68 ? 2 : 1;
  for (let x = -lanes; x <= lanes; x += 1) addRoad(commands, world, x, true);
  for (let y = -lanes; y <= lanes; y += 1) addRoad(commands, world, y, false);
  if (q > 0.48) for (let x = -1; x <= 1; x += 1) for (let y = -1; y <= 1; y += 1) addPatch(commands, world, x, y);
}

function addRoad(commands, world, lane, vertical) {
  const p = world.player;
  const pos = vertical ? [p.x + lane * 360, -14, p.y] : [p.x, -13, p.y + lane * 360];
  const scale = vertical ? [18, 1, 1550] : [1550, 1, 18];
  commands.push(cmd('cube', pos, scale, 0, hsl(world.level.hue + 28, 42, 18), 0.42, 0.04));
}

function addPatch(commands, world, x, y) {
  const px = world.player.x + x * 520, py = world.player.y + y * 520;
  commands.push(cmd('disc', [px, heightAt(px, py, world.level.worldIndex) - 8, py], [285, 1, 285], 0, hsl(world.level.hue + 22 * x + 15 * y, 68, 20), 0.2, 0.03));
}
