// B"H
/**
 * @file movingSolidSolver.js
 * @description Chapter 85: the moving bridge becomes ordinary earth beneath
 * the chossid. The Awtsmoos forbids the platform from stealing horizontal
 * agency: it may carry the rider by its own delta once per motion tick, snap
 * feet to the top, and declare grounded. It may not damp walking, erase input,
 * cancel jump, or multiply sliding memory.
 */
import { boxFromCenter, boxesOverlap, pointInPathBox, sweptBox } from "./aabb.js";
import { currentFeetY, playerAabb, playerPosition, snapFeetToTop, syncPlayerVisuals, translatePlayer } from "./playerCapsuleBox.js";

const EPS = 0.0005;
const TOP_TOLERANCE = 0.72;
const XZ_EDGE_PAD = 0.24;
const CARRIER_STICK_FRAMES = 6;
const SIDE_PUSH_LIMIT = 0.02;

/** @param {object} body Runtime body. @param {object} player Chossid-like player. @returns {object} */
export function solveMovingSolid(body, player) {
  if (isJumpingAway(player)) return miss(player, body);
  const pos = playerPosition(player);
  if (!body || !player || !pos || !pointInPathBox(pos, body.pathBox)) return miss(player, body);
  const playerBox = playerAabb(player);
  if (!playerBox) return miss(player, body);
  const swept = sweptToBox(sweptBox(body.previousPosition, body.position, body.halfExtents));
  if (!boxesOverlap(expandY(swept, TOP_TOLERANCE), playerBox)) return miss(player, body);
  if (landedOnTop(body, player, playerBox) || stillRiding(body, player, playerBox)) return supportTop(body, player);
  const bodyBox = boxFromCenter(body.position, body.halfExtents);
  if (boxesOverlap(bodyBox, playerBox)) return softenSideOverlap(body, player, bodyBox, playerBox);
  return miss(player, body);
}

/** @param {object} player Player. @returns {boolean} */
function isJumpingAway(player) {
  return Boolean(player?.moving?.jump && Number(player?.velocity?.y) > 0.01);
}

/** @param {object} swept Swept fields. @returns {object} */
function sweptToBox(swept) {
  return { minX: swept.sweptMinX, maxX: swept.sweptMaxX, minY: swept.sweptMinY, maxY: swept.sweptMaxY, minZ: swept.sweptMinZ, maxZ: swept.sweptMaxZ };
}

/** @param {object} box AABB. @param {number} pad Vertical pad. @returns {object} */
function expandY(box, pad) {
  return { ...box, minY: box.minY - pad, maxY: box.maxY + pad };
}

/** @param {object} body Dynamic body. @param {object} pbox Player box. @returns {boolean} */
function insidePlatformXZ(body, pbox) {
  return pbox.maxX > body.position.x - body.halfExtents.x - XZ_EDGE_PAD &&
    pbox.minX < body.position.x + body.halfExtents.x + XZ_EDGE_PAD &&
    pbox.maxZ > body.position.z - body.halfExtents.z - XZ_EDGE_PAD &&
    pbox.minZ < body.position.z + body.halfExtents.z + XZ_EDGE_PAD;
}

/** @param {object} body Dynamic body. @param {object} player Player. @param {object} pbox Player box. @returns {boolean} */
function landedOnTop(body, player, pbox) {
  const previousFeet = player.__dynamicFeetPreviousY ?? currentFeetY(player);
  const feetNow = currentFeetY(player);
  const previousTop = body.previousPosition.y + body.halfExtents.y;
  const topNow = body.position.y + body.halfExtents.y;
  const crossing = previousFeet >= previousTop - TOP_TOLERANCE && feetNow <= topNow + TOP_TOLERANCE;
  const resting = Math.abs(feetNow - topNow) <= TOP_TOLERANCE;
  return insidePlatformXZ(body, pbox) && (crossing || resting);
}

/** @param {object} body Dynamic body. @param {object} player Player. @param {object} pbox Player box. @returns {boolean} */
function stillRiding(body, player, pbox) {
  if (player.__supportedByDynamicBody !== body) return false;
  const frames = Number(player.__dynamicCarrierFrames || 0);
  if (frames <= 0) return false;
  const topNow = body.position.y + body.halfExtents.y;
  return insidePlatformXZ(body, pbox) && Math.abs(currentFeetY(player) - topNow) <= TOP_TOLERANCE * 1.5;
}

/** @param {object} body Dynamic body. @param {object} player Player. @returns {object} */
function supportTop(body, player) {
  const topY = body.position.y + body.halfExtents.y;
  const carried = carryOnceForMotionTick(body, player);
  snapFeetToTop(player, topY);
  markGrounded(player);
  player.__supportedByDynamicBody = body;
  player.__dynamicCarrierFrames = CARRIER_STICK_FRAMES;
  syncPlayerVisuals(player);
  player.__dynamicFeetPreviousY = topY + EPS;
  return { hit: true, type: carried ? "top-carried" : "top-stable" };
}

/** @param {object} body Dynamic body. @param {object} player Player. @returns {boolean} */
function carryOnceForMotionTick(body, player) {
  const tick = body.motionTick ?? 0;
  const stamp = `${body.id || body.owner?.name || "body"}:${tick}`;
  if (player.__lastDynamicCarryStamp === stamp) return false;
  player.__lastDynamicCarryStamp = stamp;
  translatePlayer(player, { x: body.velocity.x, y: body.velocity.y, z: body.velocity.z });
  return true;
}

/** @param {object} player Player. @returns {void} */
function markGrounded(player) {
  player.onFloor = true;
  player.isOnGround = true;
  player.onGround = true;
  player.grounded = true;
  player.fallingFrames = 0;
  if (player.velocity && player.velocity.y < 0) player.velocity.y = 0;
}

/** @param {object} body Dynamic body. @param {object} player Player. @param {object} bbox Body box. @param {object} pbox Player box. @returns {object} */
function softenSideOverlap(body, player, bbox, pbox) {
  const push = nearestFacePush(bbox, pbox);
  const limited = limitPush(push);
  translatePlayer(player, limited);
  syncPlayerVisuals(player);
  rememberFeet(player, body, false);
  return { hit: true, type: `soft-${push.face}` };
}

/** @param {object} push Push vector. @returns {object} */
function limitPush(push) {
  return { x: clamp(push.x, -SIDE_PUSH_LIMIT, SIDE_PUSH_LIMIT), y: 0, z: clamp(push.z, -SIDE_PUSH_LIMIT, SIDE_PUSH_LIMIT), face: push.face };
}

/** @param {number} value Value. @param {number} min Min. @param {number} max Max. @returns {number} */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

/** @param {object} bodyBox Moving box. @param {object} playerBox Player box. @returns {object} */
function nearestFacePush(bodyBox, playerBox) {
  const pushes = [
    { face: "left", x: -(playerBox.maxX - bodyBox.minX) - EPS, y: 0, z: 0, depth: playerBox.maxX - bodyBox.minX },
    { face: "right", x: bodyBox.maxX - playerBox.minX + EPS, y: 0, z: 0, depth: bodyBox.maxX - playerBox.minX },
    { face: "front", x: 0, y: 0, z: -(playerBox.maxZ - bodyBox.minZ) - EPS, depth: playerBox.maxZ - bodyBox.minZ },
    { face: "back", x: 0, y: 0, z: bodyBox.maxZ - playerBox.minZ + EPS, depth: bodyBox.maxZ - playerBox.minZ }
  ];
  pushes.sort((a, b) => a.depth - b.depth);
  return pushes[0];
}

/** @param {object} player Player. @param {object} body Dynamic body. @returns {object} */
function miss(player, body) {
  if (player) rememberFeet(player, body, true);
  return { hit: false, type: null };
}

/** @param {object} player Player. @param {object} body Dynamic body. @param {boolean} decayCarrier Whether to decay support grace. @returns {void} */
function rememberFeet(player, body, decayCarrier) {
  player.__dynamicFeetPreviousY = currentFeetY(player);
  if (!decayCarrier || player.__supportedByDynamicBody !== body) return;
  player.__dynamicCarrierFrames = Math.max(0, Number(player.__dynamicCarrierFrames || 0) - 1);
  if (player.__dynamicCarrierFrames <= 0) player.__supportedByDynamicBody = null;
}
