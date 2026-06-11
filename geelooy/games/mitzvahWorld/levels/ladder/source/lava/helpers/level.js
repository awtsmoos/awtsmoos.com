// B"H
/**
 * @file level.js
 * @description
 * Chapter 645: The lava level assembler writes a conditional readable contract.
 *
 * The Awtsmoos does not demand blue moving platforms from the first quiet steps.
 * If a level has motion, the contract names motion. If a platform bears reward
 * and finish together, it wears both crowns through `visualRoles`.
 */
import { bounds } from './bounds.js';
import { fallReset, lava, terrain } from './hazards.js';
import { box, coins, objective, player, returnDoor } from './rewards.js';
import { levelPresentation, markPlatform } from './theme.js';

function estimatedDifficulty(platforms) {
  return Number((platforms.length + platforms.filter(p => p.moving).length * 2.5 + platforms.filter(p => p.visualRoles?.includes('crumb')).length * 1.4).toFixed(2));
}

function requiredRoles(moving) {
  const roles = ['start', 'path', 'reward', 'finish'];
  if (moving.length) roles.splice(2, 0, 'moving');
  return roles;
}

export function level({ level, title, description, solid, moving = [], coinPlacements, boxOn, doorOn }) {
  const all = [...solid, ...moving];
  const rewardPlatform = boxOn || all[all.length - 2];
  const finishPlatform = doorOn || all[all.length - 1];
  markPlatform(solid[0], 'start');
  solid.slice(1, -1).forEach(platform => markPlatform(platform, platform.visualRole || 'path'));
  moving.forEach(platform => markPlatform(platform, 'moving'));
  markPlatform(rewardPlatform, 'reward');
  markPlatform(finishPlatform, 'finish');
  const b = bounds(all);
  const rewardCoins = coins(level, coinPlacements || all.slice(1, -1).map(p => [p]));
  const presentation = levelPresentation(level, estimatedDifficulty(all));
  return {
    format: 'awtsmoos-level-json-v1',
    id: `ladder-${level}`,
    shaym: `ladder-${level}`,
    title,
    description,
    presentation,
    gameplayContract: {
      startPlatform: solid[0]?.name,
      finishPlatform: finishPlatform?.name,
      rewardPlatform: rewardPlatform?.name,
      requiredVisualRoles: requiredRoles(moving),
      playerModel: 'https://models-3122d.web.app/chossid.glb?k=2'
    },
    nivrayim: {
      Chossid: player(solid[0]),
      ProceduralTerrain: terrain(level, b),
      SpikeField: lava(level, b, solid[0]),
      SolidBlock: solid,
      MovingPlatform: moving,
      Coin: rewardCoins,
      TzedakahBox: box(level, rewardPlatform),
      InteractiveDoor: returnDoor(level, finishPlatform),
      FallResetTrigger: fallReset(level, b, solid[0])
    },
    objectives: objective(level, rewardCoins.length)
  };
}
