// B"H
/**
 * @file rewards.js
 * @description Chapter 580: Rewards sit on platform tops; never in the lava,
 * never floating in impossible air.
 */
import { r, topOf, v3 } from './vector.js';
export function coin(name, platform, dx = 0, dz = 0) { return { name, position: v3(platform.position.x + dx, topOf(platform) + 0.72, platform.position.z + dz), value: 1, proximity: 1.15, golem: { guf: { CylinderGeometry: [0.42, 0.42, 0.1, 32] }, toyr: { MeshBasicMaterial: { color: 0xffcc33 } } } }; }
export function coins(level, placements) { return placements.map(([platform, dx = 0, dz = 0], i) => coin(`level_${level}_peruta_${i + 1}`, platform, dx, dz)); }
export function box(level, platform, dx = 0, dz = 0) { return [{ name: `level_${level}_tzedakah_box`, position: v3(platform.position.x + dx, topOf(platform) + 0.55, platform.position.z + dz), reward: 5 + level, proximity: 1.5 }]; }
export function returnDoor(level, platform, dx = 1.2, dz = 0) { return [{ name: `level_${level}_return_gate`, position: v3(platform.position.x + dx, topOf(platform) + 0.05, platform.position.z + dz), targetPath: 'village.json', target: 'village.json', proximity: 2.1, height: 3.2, width: 1.8, isSolid: false }]; }
export function player(platform) { return [{ name: 'player', position: v3(platform.position.x, topOf(platform) + 0.08, platform.position.z), visualGroundBiasY: -0.12, dynamicSolidRadius: 0.28, modelScale: 1, heesHawveh: true }]; }
export function objective(level, count) { return [{ id: `level_${level}_collect_perutos`, type: 'collect', target: 'Coin', count: r(Math.min(count, 9 + level)) }]; }
