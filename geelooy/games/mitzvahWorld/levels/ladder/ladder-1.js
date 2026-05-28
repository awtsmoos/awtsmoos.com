// B"H
/**
 * @file ladder-1.js
 * @description
 * Chapter 24: The first ladder clears thorns from every safe stone.
 *
 * The Awtsmoos separates platform from punishment. The spike carpet remains in
 * the desert gaps, but start slab, stairs, jump stones, rest slab, and gate
 * landing carve safe rectangles out of it. This prevents instant spike death
 * while standing on or resetting to a valid platform.
 */
import {
  bonus,
  coin,
  door,
  level,
  platform,
  player,
  resetPit,
  safeRectsFrom,
  sky,
  spikeFloor,
  stairs,
  terrain
} from './helpers.js?v=lean-l1-20260528-bh28';

const solids = [
  platform('start_slab', -6, 0, 0, 10, 8, 0xd6b46b),
  stairs('starter_steps', -0.5, 0.45, -3.8, 5, 2.2, 4),
  platform('jump_01', 8, 2.6, -5, 6, 4, 0xc6aa62),
  stairs('mid_steps', 14, 3.0, -1.2, 4, 1.8, 3),
  platform('jump_02', 20, 4.6, 4, 6, 4, 0xb98f4a),
  platform('wide_rest', 31, 5.8, 0, 9, 5, 0xb9954f),
  stairs('final_steps', 39, 6.1, 0, 4, 1.6, 3),
  platform('gate_landing', 46, 7.4, 0, 10, 8, 0xa77d3d)
];

const spikes = spikeFloor({
  minX: -20,
  maxX: 55,
  minZ: -14,
  maxZ: 14,
  step: 2.15,
  exclude: safeRectsFrom(solids),
  margin: 2.85
});

export default level('Desert_Dust_Gate', 7, 'ladder-2.js', {
  ProceduralSky: { brightDesertSky: sky() },
  ProceduralTerrain: { sandFloor: terrain('Dust_Gate_Sand', 'sand') },
  Chossid: [player(-8, 5, 0)],
  SolidBlock: solids,
  SpikeHazard: spikes,
  Coin: [
    coin('p1', -1, 2.1, -2),
    coin('p2', 4, 3.1, -4),
    coin('p3', 8, 4.3, -5),
    coin('p4', 15, 5.0, -1),
    coin('p5', 20, 6.0, 4),
    coin('p6', 31, 7.2, 0),
    coin('p7', 43, 8.2, 0),
    bonus('optional_global_sela', 47, 8.5, 2.8, 3)
  ],
  InteractiveDoor: [door('Gate to Mirror Dunes', 52, 10, 0, 'ladder-2.js')],
  FallResetTrigger: [resetPit('fall_reset_under_world', 20, -12, 0, 140, 120)]
});
