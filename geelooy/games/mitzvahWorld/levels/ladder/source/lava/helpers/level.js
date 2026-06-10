// B"H
/**
 * @file level.js
 * @description Chapter 581: Assembles a handmade course into Awtsmoos level JSON
 * without inventing the course itself.
 */
import { bounds } from './bounds.js';
import { fallReset, lava, terrain } from './hazards.js';
import { box, coins, objective, player, returnDoor } from './rewards.js';
export function level({ level, title, description, solid, moving = [], coinPlacements, boxOn, doorOn }) {
  const all = [...solid, ...moving], b = bounds(all), rewardCoins = coins(level, coinPlacements || all.slice(1, -1).map(p => [p]));
  return { format: 'awtsmoos-level-json-v1', id: `ladder-${level}`, shaym: `ladder-${level}`, title, description, nivrayim: { Chossid: player(solid[0]), ProceduralTerrain: terrain(level, b), SpikeField: lava(level, b), SolidBlock: solid, MovingPlatform: moving, Coin: rewardCoins, TzedakahBox: box(level, boxOn || all[all.length - 2]), InteractiveDoor: returnDoor(level, doorOn || all[all.length - 1]), FallResetTrigger: fallReset(level, b, solid[0]) }, objectives: objective(level, rewardCoins.length) };
}
