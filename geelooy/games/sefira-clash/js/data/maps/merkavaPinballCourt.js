import { bounds, hole, makeMap, platform, points, sideWalls, solidFloor, wall } from './factory.js';

/** B"H — Merkava Pinball Court, a bounce-heavy enclosed smash chamber. */
export const merkavaPinballCourt = makeMap({
  id: 'merkava-pinball-court', name: 'Merkava Pinball Court', theme: 'cosmic', hue: 210,
  description: 'Bouncy side walls, angled chambers, and narrow escape gaps.',
  bounds: bounds(-1300, 5600, -1900, 1900), rules: { walled: true, wallBounce: true },
  holes: [hole(2520, 460)],
  walls: [...sideWalls(-1050, 5350, -1720, 1180, 95), wall(1300, 240, 90, 560, 'pillar'), wall(3820, 240, 90, 560, 'pillar')],
  spawns: points([-650, 830], [360, 830], [1700, 160], [2860, 830], [4300, 160], [5040, 830]),
  platforms: [
    ...solidFloor(-1050, 910, 6400, 72, [hole(2520, 460)]),
    platform(-420, 480, 650, 32, 'ramp'), platform(720, 180, 480, 28, 'ramp'),
    platform(1900, 470, 560, 32, 'middle'), platform(3250, 470, 560, 32, 'middle'),
    platform(4350, 180, 480, 28, 'ramp')
  ],
  weaponSpawns: points([-420, 820], [970, 120], [2170, 420], [3550, 420], [4600, 120]),
  powerupSpawns: points([160, 760], [1500, 150], [2880, 760], [4400, 150])
});
