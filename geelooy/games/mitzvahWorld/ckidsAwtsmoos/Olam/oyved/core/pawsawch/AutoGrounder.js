// B"H
/**
 * @file AutoGrounder.js
 * @description
 * Chapter 23: The Earth Stopped Swallowing The Game.
 *
 * The Awtsmoos revealed the hidden culprit: a village prop helper was snapping
 * every loaded mesh to default earth, including coins, gameplay platforms, and
 * sometimes the player garment. Lava levels author exact Y coordinates; those
 * coordinates are law. Auto-grounding is now only for decorative things that
 * ask for it by omitting Y or by declaring `autoGround`, `groundY`, or
 * `groundLift`.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const DEFAULT_GROUND_Y = -0.2;
const NEVER_GROUND_TYPES = new Set([
  "chossid", "chai", "coin", "solidblock", "movingplatform", "spikefield",
  "fallresettrigger", "interactivedoor", "tzedakahbox", "proceduralsky",
  "proceduralterrain", "lavavisual", "grasspatch", "particle"
]);

/** @param {unknown} value Candidate number. @param {number} fallback Fallback. @returns {number} */
function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {object} nivra Loaded entity. @returns {string} Lowercase gameplay type. */
function typeOf(nivra) {
  return String(nivra?.type || nivra?.constructor?.name || nivra?.options?.className || nivra?.options?.type || "").toLowerCase();
}

/** @param {object} nivra Loaded entity. @returns {boolean} True when JSON authored Y explicitly. */
function hasExplicitY(nivra) {
  const opt = nivra?.options || {};
  return Number.isFinite(Number(opt.position?.y)) || Number.isFinite(Number(nivra?.position?.y));
}

/** @param {object} nivra Loaded entity. @returns {boolean} True when data asks for grounding. */
function asksForGround(nivra) {
  const opt = nivra?.options || {};
  return opt.autoGround === true || opt.grounded === true || opt.ground === true ||
    Object.prototype.hasOwnProperty.call(opt, "autoGroundY") ||
    Object.prototype.hasOwnProperty.call(opt, "groundY") ||
    Object.prototype.hasOwnProperty.call(opt, "groundLift");
}

/**
 * Decides whether the helper may snap this entity.
 *
 * @param {object} nivra Loaded entity.
 * @returns {boolean} True only for decorative/unpositioned groundable matter.
 */
function shouldGround(nivra) {
  if (!nivra || !nivra.mesh) return false;
  const type = typeOf(nivra);
  if (NEVER_GROUND_TYPES.has(type)) return false;
  if (nivra.mesh.userData?.isPlayer || nivra.mesh.userData?.isLiving || nivra.mesh.userData?.skipOctree) return false;
  if (hasExplicitY(nivra) && !asksForGround(nivra)) return false;
  return asksForGround(nivra) || !hasExplicitY(nivra);
}

/** @param {object} nivra Loaded entity. @returns {number} Target ground Y. */
function groundYFor(nivra) {
  const opt = nivra.options || {};
  return finite(opt.autoGroundY ?? opt.groundY, DEFAULT_GROUND_Y) + finite(opt.groundLift, 0);
}

/** @param {object} nivra Loaded entity. @param {number} y New Y. @returns {void} */
function setEntityY(nivra, y) {
  nivra.mesh.position.y = y;
  if (nivra.position) nivra.position.y = y;
  if (nivra.body?.position) nivra.body.position.y = y;
}

/** @param {object} nivra Loaded entity. @returns {boolean} True when checked. */
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
 * Snaps only eligible decorative/unpositioned entities to ground.
 *
 * @param {any[]} nivrayim Loaded entities.
 * @returns {{checked:number,snapped:number,skipped:number}}
 */
export function autoGroundNivrayim(nivrayim = []) {
  let checked = 0;
  let snapped = 0;
  let skipped = 0;
  for (const nivra of nivrayim) {
    if (!shouldGround(nivra)) { skipped += 1; continue; }
    checked += 1;
    if (snapOne(nivra)) snapped += 1;
  }
  return { checked, snapped, skipped };
}
