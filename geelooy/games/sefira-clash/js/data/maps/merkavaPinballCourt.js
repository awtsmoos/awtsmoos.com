import { bounds, hole, makeMap, platform, points, sideWalls, solidFloor, wall } from './factory.js';

/**
 * B"H
 * Merkava Pinball Court, engagement-tuned.
 *
 * Chapter 48: the bounce chamber keeps its strange machinery, but early combat
 * now ignites near the middle before fighters ricochet into distant lanes.
 */
export const merkavaPinballCourt = makeMap({
  id: 'merkava-pinball-court', name: 'Merkava Pinball Court', theme: 'cosmic', hue: 210,
  description: 'Bouncy side walls, angled chambers, narrow gaps, and faster first clashes.',
  bounds: bounds(-1300, 5600, -1900, 1900), rules: { walled: true, wallBounce: true },
  holes: [hole(2520, 460)],
  walls: [...sideWalls(-1050, 5350, -1720, 1180, 95), wall(1300, 240, 90, 560, 'pillar'), wall(3820, 240, 90, 560, 'pillar')],
  spawns: points([980, 830], [1660, 160], [2240, 830], [2940, 830], [3500, 160], [4180, 830]),
  platforms: [
    ...solidFloor(-1050, 910, 6400, 72, [hole(2520, 460)]),
    platform(-420, 480, 650, 32, 'ramp'), platform(720, 180, 480, 28, 'ramp'),
    platform(1900, 470, 560, 32, 'middle'), platform(3250, 470, 560, 32, 'middle'),
    platform(2380, 130, 620, 26, 'rally'), platform(4350, 180, 480, 28, 'ramp')
  ],
  weaponSpawns: points([970, 820], [1660, 120], [2170, 420], [3550, 420], [4300, 120]),
  powerupSpawns: points([1280, 760], [1880, 150], [2880, 760], [3800, 150])
});
