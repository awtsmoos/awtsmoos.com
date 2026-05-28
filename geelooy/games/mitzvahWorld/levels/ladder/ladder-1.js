// B"H
/**
 * @file ladder-1.js
 * @description
 * Chapter 2: Dust Gate becomes quiet.
 *
 * The first desert course now carries only authored platforms, coins, simple
 * spikes, one simple door, one terrain, one lean Chossid, and one fall reset.
 * The start slab has a small ground-return stair chain so falling to the sand
 * does not trap the player below the course.
 */
import {
  bonus,
  coin,
  door,
  level,
  platform,
  player,
  resetPit,
  spike,
  terrain
} from './helpers.js';

export default level('Desert_Dust_Gate', 7, 'ladder-2.js', {
  ProceduralTerrain: {
    sandFloor: terrain('Dust_Gate_Sand', 'sand')
  },
  Chossid: [
    player(-8, 5, 0)
  ],
  SolidBlock: [
    platform('ground_return_01', -18, -2.0, 5, 8, 5, 0xd2b878),
    platform('ground_return_02', -14, -1.0, 3, 8, 5, 0xd2b878),
    platform('ground_return_03', -10, 0.0, 1, 8, 5, 0xd2b878),
    platform('start_slab', -6, 0, 0, 13, 9, 0xd6b46b),
    platform('climb_back_low', 1, 1.0, -4, 5, 4, 0xd0b46b),
    platform('jump_01', 8, 2.0, -5, 7, 4, 0xc6aa62),
    platform('climb_back_mid', 14, 3.1, -1, 5, 3, 0xd0b46b),
    platform('jump_02', 20, 4.0, 4, 7, 4, 0xc6aa62),
    platform('wide_rest', 31, 5.2, 0, 10, 5, 0xb9954f),
    platform('gate_landing', 44, 6.4, 0, 12, 8, 0xa77d3d)
  ],
  SpikeHazard: [
    spike('spike_under_start_left', -2, -1.4, -4, 0, 1.05),
    spike('spike_under_start_right', 2, -1.4, 4, 0, 1.05),
    spike('spike_under_jump_01_a', 7, 0.1, -6, 0, 1.25),
    spike('spike_under_jump_01_b', 10, 0.1, -4, 0, 1.25),
    spike('spike_under_climb_mid', 15, 1.3, -1, 0, 1.2),
    spike('spike_under_jump_02_a', 19, 2.1, 3, 0, 1.25),
    spike('spike_under_jump_02_b', 22, 2.1, 5, 0, 1.25),
    spike('spike_under_rest_left', 28, 3.2, -3, 0, 1.25),
    spike('spike_under_rest_right', 34, 3.2, 3, 0, 1.25),
    spike('spike_under_gate', 43, 4.4, -4, 0, 1.2)
  ],
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
