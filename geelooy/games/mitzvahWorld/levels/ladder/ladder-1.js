// B"H
/**
 * @file ladder-1.js
 * @description
 * Chapter 49: The lava renders without texture warnings, and the gate stands
 * closer to the visible landing so the player sees the destination.
 */
import { bonus, coin, door, lavaField, level, movingBlock, platform, player, resetPit, sky, spikedBall, stairs, terrain } from './helpers.js?v=lean-l1-20260528-bh49';

const solids = [
  platform('start_slab', -6, 0, 0, 10, 8, 0xd6b46b),
  stairs('starter_steps', -0.5, 0.45, -3.8, 5, 2.2, 4),
  platform('missing_bridge_restored', 3.2, 1.7, -4.3, 4.4, 3.1, 0xd7bd72),
  platform('jump_01', 8, 2.6, -5, 6, 4, 0xc6aa62),
  stairs('mid_steps', 14, 3.0, -1.2, 4, 1.8, 3),
  platform('jump_02', 20, 4.6, 4, 6, 4, 0xb98f4a),
  platform('wide_rest', 31, 5.8, 0, 9, 5, 0xb9954f),
  stairs('final_steps', 39, 6.1, 0, 4, 1.6, 3),
  platform('gate_landing', 46, 7.4, 0, 12, 9, 0xa77d3d)
];

export default level('Desert_Dust_Gate', 7, 'ladder-2.js', {
  ProceduralSky: { brightDesertSky: sky() },
  ProceduralTerrain: { sandFloor: terrain('Dust_Gate_Sand', 'sand') },
  Chossid: [player(-8, 5, 0)],
  SolidBlock: solids,
  SpikeField: [lavaField({ name: 'molten_floor_under_ladder', minX: -20, maxX: 55, minZ: -14, maxZ: 14 })],
  SpikedBallHazard: [spikedBall('single_spike_ball_patrol', 16.2, 5.2, -1.1, 'x', 2.4, 1.05)],
  MovingPushBlock: [movingBlock('push_block_trial', 30.8, 7.1, 0, 'z', 2.2, 0.95)],
  Coin: [coin('p1', -1, 2.1, -2), coin('p2', 4, 3.2, -4.3), coin('p3', 8, 4.3, -5), coin('p4', 15, 5.0, -1), coin('p5', 20, 6.0, 4), coin('p6', 31, 7.2, 0), coin('p7', 43, 8.2, 0), bonus('optional_global_sela', 47, 8.5, 2.8, 3)],
  InteractiveDoor: [door('Gate to Mirror Dunes', 47, 9.25, 0, 'ladder-2.js')],
  FallResetTrigger: [resetPit('fall_reset_under_world', 20, -12, 0, 140, 120)]
});
