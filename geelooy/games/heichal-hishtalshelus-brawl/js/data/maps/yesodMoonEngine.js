import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Yesod pulls fighters through moonlit arcs and recovery mind games. */
export const yesodMoonEngine = makeMap({
  id: 'yesod-moon', name: 'Yesod Moon Engine', theme: 'blue', hue: 264,
  description: 'Moonlit vertical platforms for juggling and recovery denial.', bounds: bounds(-1900, 6900, -1750, 1500),
  spawns: points([-100, 160], [900, -120], [2200, 160], [3600, -120], [5050, 160]),
  platforms: [...lane(-1000, 790, 8), ...steps(-400, 510, 10), ...steps(-120, 40, 9), platform(2620, -420, 620, 24, 'moon')],
  weaponSpawns: points([300, 450], [1380, 10], [2800, -460], [4200, 10], [5480, 450]),
  powerupSpawns: points([720, 210], [1820, -120], [3020, -520], [4420, -120])
});
