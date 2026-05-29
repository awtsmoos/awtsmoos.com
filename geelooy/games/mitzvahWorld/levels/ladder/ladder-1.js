// B"H
/**
 * @file ladder-1.js
 * @description
 * Chapter 56: Static floor below, moving block above.
 * The Awtsmoos keeps the under-platform as octree truth while the moving block
 * hovers higher as a separate live AABB obstacle.
 */
import { block, bonus, coin, door, lavaField, level, movingBlock, platform, player, resetPit, sky, spikedBall, stairs, terrain } from './helpers.js?v=lean-l1-20260528-bh56';

const gate = [
  block('VISIBLE_DOOR_LEFT_COLUMN', 45.5, 9.95, -1.65, 0.72, 4.15, 0.72, 0xe5d184),
  block('VISIBLE_DOOR_RIGHT_COLUMN', 45.5, 9.95, 1.65, 0.72, 4.15, 0.72, 0xe5d184),
  block('VISIBLE_DOOR_GOLD_LINTEL', 45.5, 12.15, 0, 0.86, 0.52, 4.15, 0xffd45a),
  block('VISIBLE_DOOR_CROWN_TOP', 45.5, 12.85, 0, 0.78, 0.54, 2.25, 0xffed9c),
  block('VISIBLE_MEZUZAH_INSIDE_RIGHT', 45.08, 10.35, 1.24, 0.18, 1.15, 0.12, 0x74fff4)
];

const solids = [
  platform('start_slab', -6, 0, 0, 10, 8, 0xd6b46b),
  stairs('starter_steps', -0.5, 0.45, -3.8, 5, 2.2, 4),
  platform('missing_bridge_restored', 3.2, 1.7, -4.3, 4.4, 3.1, 0xd7bd72),
  platform('jump_01', 8, 2.6, -5, 6, 4, 0xc6aa62),
  stairs('mid_steps', 14, 3.0, -1.2, 4, 1.8, 3),
  platform('jump_02', 20, 4.6, 4, 6, 4, 0xb98f4a),
  platform('wide_rest', 31, 5.8, 0, 9, 5, 0xb9954f),
  stairs('final_steps', 39, 6.1, 0, 4, 1.6, 3),
  platform('gate_landing', 46, 7.4, 0, 14, 10, 0xa77d3d),
  ...gate
];

export default level('Desert_Dust_Gate', 7, 'ladder-2.js', {
  ProceduralSky: { brightDesertSky: sky() },
  ProceduralTerrain: { sandFloor: terrain('Dust_Gate_Sand', 'sand') },
  Chossid: [player(-8, 5, 0)],
  SolidBlock: solids,
  SpikeField: [lavaField({ name: 'molten_floor_under_ladder', minX: -20, maxX: 55, minZ: -14, maxZ: 14 })],
  SpikedBallHazard: [spikedBall('single_spike_ball_patrol', 16.2, 5.2, -1.1, 'x', 2.4, 1.05)],
  MovingPushBlock: [movingBlock('push_block_trial', 30.8, 8.05, 0, 'z', 2.2, 1.15)],
  Coin: [coin('p1', -1, 2.1, -2), coin('p2', 4, 3.2, -4.3), coin('p3', 8, 4.3, -5), coin('p4', 15, 5.0, -1), coin('p5', 20, 6.0, 4), coin('p6', 31, 7.2, 0), coin('p7', 43, 8.2, 0), bonus('optional_global_sela', 47, 8.5, 2.8, 3)],
  InteractiveDoor: [door('Touch the Mezuzah', 45.08, 10.35, 1.24, 'ladder-2.js')],
  FallResetTrigger: [resetPit('fall_reset_under_world', 20, -12, 0, 140, 120)]
});
