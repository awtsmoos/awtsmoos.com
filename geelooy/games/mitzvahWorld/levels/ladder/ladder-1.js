// B"H
/**
 * @file ladder-1.js
 * @description
 * Chapter 6: Dust Gate stays fast, visible, textured, and dangerous below.
 *
 * The black-screen bug was caused by a level with Lambert objects but no bright
 * sky/light vessel. This authored level now explicitly includes ProceduralSky.
 */
import {
  bonus,
  coin,
  door,
  level,
  platform,
  player,
  resetPit,
  sky,
  spikeFloor,
  terrain
} from './helpers.js?v=lean-l1-20260528-bh11';

const solids = [
  platform('ground_return_01', -18, -2.0, 5, 8, 5, 0xd2b878),
  platform('ground_return_02', -14, -1.0, 3, 8, 5, 0xd0b06a),
  platform('ground_return_03', -10, 0.0, 1, 8, 5, 0xcaa15a),
  platform('start_slab', -6, 0, 0, 13, 9, 0xd6b46b),
  platform('climb_back_low', 1, 1.0, -4, 5, 4, 0xbfa75d),
  platform('jump_01', 8, 2.0, -5, 7, 4, 0xc6aa62),
  platform('climb_back_mid', 14, 3.1, -1, 5, 3, 0xd1a95e),
  platform('jump_02', 20, 4.0, 4, 7, 4, 0xb98f4a),
  platform('wide_rest', 31, 5.2, 0, 10, 5, 0xb9954f),
  platform('gate_landing', 44, 6.4, 0, 12, 8, 0xa77d3d)
];

const spikes = spikeFloor({ minX: -18, maxX: 50, minZ: -13, maxZ: 13, y: -0.95, step: 3.05 });

export default level('Desert_Dust_Gate', 7, 'ladder-2.js', {
  ProceduralSky: {
    brightDesertSky: sky()
  },
  ProceduralTerrain: {
    sandFloor: terrain('Dust_Gate_Sand', 'sand')
  },
  Chossid: [
    player(-8, 5, 0)
  ],
  SolidBlock: solids,
  SpikeHazard: spikes,
  Coin: [
    coin('p1', -1, 1.4, -2),
    coin('p2', 4, 2.2, -4),
    coin('p3', 8, 3.3, -5),
    coin('p4', 15, 4.2, -1),
    coin('p5', 20, 5.2, 4),
    coin('p6', 31, 6.4, 0),
    coin('p7', 43, 7.6, 0),
    bonus('optional_global_sela', 46, 7.8, 2.8, 3)
  ],
  InteractiveDoor: [
    door('Gate to Mirror Dunes', 50, 9.1, 0, 'ladder-2.js')
  ],
  FallResetTrigger: [
    resetPit('fall_reset_under_world', 20, -12, 0, 140, 120)
  ]
});
