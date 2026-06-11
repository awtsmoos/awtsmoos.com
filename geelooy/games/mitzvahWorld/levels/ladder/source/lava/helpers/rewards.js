// B"H
/**
 * @file rewards.js
 * @description
 * Chapter 642: Rewards become mission language, not hidden accounting.
 *
 * The Awtsmoos is hidden even in a JSON helper: a missing `path` once made the
 * player descend as a pale emergency cube, and a return gate once used a field
 * that one door class did not hear. Now reward vessels speak body, UI, and route:
 * `path` for the Chossid GLB, all route aliases for gates, and explicit mission
 * cards for the player.
 */
import { r, topOf, v3 } from './vector.js';
import { LAVA_THEME } from './theme.js';

const CHOSSID_MODEL = 'https://models-3122d.web.app/chossid.glb?k=2';
const PLAYER_FEET_LIFT = 0.08;
const CAMERA_SAFE_DEPTH_RATIO = 0.4;
const CAMERA_SAFE_DEPTH_MAX = 2.4;
const COURSE_CAMERA = { cameraDistance: 5.8, cameraTheta: 45, cameraPhi: 30, cameraTargetHeight: 1.25, ignoreCameraCollision: true };

export function coin(name, platform, dx = 0, dz = 0) {
  return {
    name,
    visualRole: 'reward',
    theme: LAVA_THEME.id,
    position: v3(platform.position.x + dx, topOf(platform) + 0.72, platform.position.z + dz),
    value: 1,
    proximity: 1.15,
    uiPulse: 'coin-spark',
    golem: { guf: { CylinderGeometry: [0.42, 0.42, 0.1, 32] }, toyr: { MeshBasicMaterial: { color: LAVA_THEME.palette.reward } } }
  };
}

export function coins(level, placements) {
  return placements.map(([platform, dx = 0, dz = 0], i) => coin(`level_${level}_peruta_${i + 1}`, platform, dx, dz));
}

export function box(level, platform, dx = 0, dz = 0) {
  return [{ name: `level_${level}_tzedakah_box`, visualRole: 'reward', theme: LAVA_THEME.id, position: v3(platform.position.x + dx, topOf(platform) + 0.55, platform.position.z + dz), reward: 5 + level, proximity: 1.5, uiPulse: 'tzedakah-gold' }];
}

export function returnDoor(level, platform, dx = 1.2, dz = 0) {
  return [{ name: `level_${level}_return_gate`, visualRole: 'finish', theme: LAVA_THEME.id, label: `Return Gate ${level}`, position: v3(platform.position.x + dx, topOf(platform) + 0.05, platform.position.z + dz), next: 'village.json', target: 'village.json', targetPath: 'village.json', proximity: 2.1, height: 3.2, width: 1.8, isSolid: false, uiPulse: 'mezuzah-cyan' }];
}

export function startFeet(platform) {
  const cameraSafeZ = r(platform.position.z + Math.min(CAMERA_SAFE_DEPTH_MAX, (platform.depth || 0) * CAMERA_SAFE_DEPTH_RATIO));
  return v3(platform.position.x, topOf(platform) + PLAYER_FEET_LIFT, cameraSafeZ);
}

export function player(platform) {
  return [{ name: 'player', path: CHOSSID_MODEL, position: startFeet(platform), rotation: { y: Math.PI / 2 }, visualGroundBiasY: -0.12, dynamicSolidRadius: 0.28, modelScale: 1, heesHawveh: true, role: 'player', theme: LAVA_THEME.id, ...COURSE_CAMERA }];
}

export function objective(level, count) {
  return [
    { id: `level_${level}_collect_perutos`, type: 'collect', target: 'Coin', count: r(Math.min(count, 9 + level)), label: 'Collect the perutos', icon: 'coin', uiOrder: 1 },
    { id: `level_${level}_give_tzedakah`, type: 'interact', target: 'TzedakahBox', count: 1, label: 'Give tzedakah', icon: 'pushkuh', uiOrder: 2 },
    { id: `level_${level}_return_gate`, type: 'interact', target: 'InteractiveDoor', count: 1, label: 'Return through the mezuzah gate', icon: 'mezuzah', uiOrder: 3 }
  ];
}
