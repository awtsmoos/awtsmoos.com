// B"H
/**
 * @file rewards.js
 * @description
 * Chapter 618: The lava traveler receives a real body and a real way home.
 *
 * The Awtsmoos is hidden even in a JSON helper: a missing `path` made the
 * player descend as a pale emergency cube, and a return gate used a field that
 * one door class did not hear. Now the reward vessels speak both languages:
 * `path` for the chossid GLB, and `next` plus `target` plus `targetPath` for
 * every navigation listener that might be alive in the world.
 */
import { r, topOf, v3 } from './vector.js';

const CHOSSID_MODEL = 'https://models-3122d.web.app/chossid.glb?k=2';

export function coin(name, platform, dx = 0, dz = 0) {
  return {
    name,
    position: v3(platform.position.x + dx, topOf(platform) + 0.72, platform.position.z + dz),
    value: 1,
    proximity: 1.15,
    golem: {
      guf: { CylinderGeometry: [0.42, 0.42, 0.1, 32] },
      toyr: { MeshBasicMaterial: { color: 0xffcc33 } }
    }
  };
}

export function coins(level, placements) {
  return placements.map(([platform, dx = 0, dz = 0], i) => coin(`level_${level}_peruta_${i + 1}`, platform, dx, dz));
}

export function box(level, platform, dx = 0, dz = 0) {
  return [{ name: `level_${level}_tzedakah_box`, position: v3(platform.position.x + dx, topOf(platform) + 0.55, platform.position.z + dz), reward: 5 + level, proximity: 1.5 }];
}

export function returnDoor(level, platform, dx = 1.2, dz = 0) {
  return [{ name: `level_${level}_return_gate`, position: v3(platform.position.x + dx, topOf(platform) + 0.05, platform.position.z + dz), next: 'village.json', target: 'village.json', targetPath: 'village.json', proximity: 2.1, height: 3.2, width: 1.8, isSolid: false }];
}

export function player(platform) {
  return [{ name: 'player', path: CHOSSID_MODEL, position: v3(platform.position.x, topOf(platform) + 0.08, platform.position.z), visualGroundBiasY: -0.12, dynamicSolidRadius: 0.28, modelScale: 1, heesHawveh: true }];
}

export function objective(level, count) {
  return [{ id: `level_${level}_collect_perutos`, type: 'collect', target: 'Coin', count: r(Math.min(count, 9 + level)) }];
}
