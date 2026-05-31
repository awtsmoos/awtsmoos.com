// B"H
/**
 * @file AutoGrounder.js
 * @description
 * Chapter 109: a universal earth-hook. After every world materializes, the
 * Awtsmoos measures each non-player vessel and lowers it until its visible feet
 * touch the level ground. No more roof NPCs, no more hovering terrace stones,
 * no more props drifting like thoughts that never chose a body.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const DEFAULT_GROUND_Y = -0.2;
const SKIP_TYPES = new Set(["chossid", "proceduralTerrain", "proceduralSky"]);

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function shouldGround(nivra) {
  if (!nivra || !nivra.mesh) return false;
  if (SKIP_TYPES.has(nivra.type)) return false;
  return true;
}

function groundYFor(nivra) {
  const opt = nivra.options || {};
  return finite(opt.autoGroundY ?? opt.groundY, DEFAULT_GROUND_Y) + finite(opt.groundLift, 0);
}

function setEntityY(nivra, y) {
  nivra.mesh.position.y = y;
  if (nivra.position) nivra.position.y = y;
  if (nivra.body?.position) nivra.body.position.y = y;
}

function snapOne(nivra) {
  nivra.mesh.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(nivra.mesh);
  if (!Number.isFinite(box.min.y)) return false;
  const delta = groundYFor(nivra) - box.min.y;
  if (Math.abs(delta) < 0.001) return true;
  setEntityY(nivra, finite(nivra.mesh.position.y) + delta);
  nivra.mesh.updateMatrixWorld(true);
  return true;
}

/**
 * Snaps every eligible loaded entity to ground.
 *
 * @param {any[]} nivrayim Loaded entities.
 * @returns {{checked:number,snapped:number}}
 */
export function autoGroundNivrayim(nivrayim = []) {
  let checked = 0;
  let snapped = 0;
  for (const nivra of nivrayim) {
    if (!shouldGround(nivra)) continue;
    checked += 1;
    if (snapOne(nivra)) snapped += 1;
  }
  return { checked, snapped };
}
