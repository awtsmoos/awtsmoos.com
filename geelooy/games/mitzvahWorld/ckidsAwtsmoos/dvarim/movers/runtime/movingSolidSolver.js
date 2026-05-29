// B"H
/**
 * @file movingSolidSolver.js
 * @description Chapter 67: the carrier law is sealed. The Awtsmoos makes a
 * moving platform into a covenant under the player's feet: if the feet remain
 * near the top, the body is carried by the platform delta every frame, grounded
 * flags are refreshed, vertical falling is cancelled, and the old static-octree
 * lie is shattered into clean AABB truth.
 */
import { boxFromCenter, boxesOverlap, pointInPathBox, sweptBox } from "./aabb.js";
import { currentFeetY, playerAabb, playerPosition, snapFeetToTop, syncPlayerVisuals, translatePlayer } from "./playerCapsuleBox.js";

const EPS = 0.0005;
const TOP_TOLERANCE = 0.55;
const XZ_EDGE_PAD = 0.18;
const CARRIER_STICK_FRAMES = 3;

/** @param {object} body Runtime body. @param {object} player Chossid-like player. */
export function solveMovingSolid(body, player) {
  const pos = playerPosition(player);
  if (!body || !player || !pos || !pointInPathBox(pos, body.pathBox)) return miss(player, body);
  const playerBox = playerAabb(player);
  if (!playerBox) return miss(player, body);
  const swept = sweptToBox(sweptBox(body.previousPosition, body.position, body.halfExtents));
  if (!boxesOverlap(expandY(swept, TOP_TOLERANCE), playerBox)) return miss(player, body);
  if (landedOnTop(body, player, playerBox) || stillRiding(body, player, playerBox)) return supportTop(body, player);
  const bodyBox = boxFromCenter(body.position, body.halfExtents);
  if (boxesOverlap(bodyBox, playerBox)) return pushSide(body, player, bodyBox, playerBox);
  return miss(player, body);
}

/** @param {object} swept Swept fields. */
function sweptToBox(swept) {
  return { minX: swept.sweptMinX, maxX: swept.sweptMaxX, minY: swept.sweptMinY, maxY: swept.sweptMaxY, minZ: swept.sweptMinZ, maxZ: swept.sweptMaxZ };
}

/** @param {object} box AABB. @param {number} pad Vertical pad. */
function expandY(box, pad) { return { ...box, minY: box.minY - pad, maxY: box.maxY + pad }; }

/** @param {object} body Dynamic body. @param {object} pbox Player box. */
function insidePlatformXZ(body, pbox) {
  return pbox.maxX > body.position.x - body.halfExtents.x - XZ_EDGE_PAD &&
    pbox.minX < body.position.x + body.halfExtents.x + XZ_EDGE_PAD &&
    pbox.maxZ > body.position.z - body.halfExtents.z - XZ_EDGE_PAD &&
    pbox.minZ < body.position.z + body.halfExtents.z + XZ_EDGE_PAD;
}

/** @param {object} body Dynamic body. @param {object} player Player. @param {object} pbox Player box. */
function landedOnTop(body, player, pbox) {
  const previousFeet = player.__dynamicFeetPreviousY ?? currentFeetY(player);
  const feetNow = currentFeetY(player);
  const previousTop = body.previousPosition.y + body.halfExtents.y;
  const topNow = body.position.y + body.halfExtents.y;
  const crossing = previousFeet >= previousTop - TOP_TOLERANCE && feetNow <= topNow + TOP_TOLERANCE;
  const resting = Math.abs(feetNow - topNow) <= TOP_TOLERANCE;
  return insidePlatformXZ(body, pbox) && (crossing || resting);
}

/** @param {object} body Dynamic body. @param {object} player Player. @param {object} pbox Player box. */
function stillRiding(body, player, pbox) {
  if (player.__supportedByDynamicBody !== body) return false;
  const frames = Number(player.__dynamicCarrierFrames || 0);
  if (frames <= 0) return false;
  const topNow = body.position.y + body.halfExtents.y;
  return insidePlatformXZ(body, pbox) && Math.abs(currentFeetY(player) - topNow) <= TOP_TOLERANCE * 1.6;
}

/** @param {object} body Dynamic body. @param {object} player Player. */
function supportTop(body, player) {
  const topY = body.position.y + body.halfExtents.y;
  snapFeetToTop(player, topY);
  translatePlayer(player, body.velocity);
  if (player.velocity) {
    player.velocity.x += body.velocity.x * 18;
    player.velocity.z += body.velocity.z * 18;
    player.velocity.y = Math.max(0, body.velocity.y * 60);
  }
  player.onFloor = true;
  player.isOnGround = true;
  player.onGround = true;
  player.grounded = true;
  player.__supportedByDynamicBody = body;
  player.__dynamicCarrierFrames = CARRIER_STICK_FRAMES;
  syncPlayerVisuals(player);
  player.__dynamicFeetPreviousY = topY + EPS;
  return { hit: true, type: "top" };
}

/** @param {object} body Dynamic body. @param {object} player Player. @param {object} bbox Body box. @param {object} pbox Player box. */
function pushSide(body, player, bbox, pbox) {
  const push = nearestFacePush(bbox, pbox);
  translatePlayer(player, push);
  translatePlayer(player, { x: body.velocity.x, y: 0, z: body.velocity.z });
  if (player.velocity) {
    player.velocity.x = body.velocity.x === 0 ? player.velocity.x : body.velocity.x * 12;
    player.velocity.z = body.velocity.z === 0 ? player.velocity.z : body.velocity.z * 12;
  }
  syncPlayerVisuals(player);
  const after = playerAabb(player);
  if (body.enableCrush && after && boxesOverlap(bbox, after)) return crush(player, body);
  rememberFeet(player, body, false);
  return { hit: true, type: push.face };
}

/** @param {object} bodyBox Moving box. @param {object} playerBox Player box. */
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

/** @param {object} player Player. @param {object} body Dynamic body. */
function crush(player, body) {
  if (typeof player.takeDamage === "function") player.takeDamage(body.crushDamage || 1000);
  else if (typeof player.setPosition === "function") player.setPosition(body.resetPosition || { x: 0, y: 10, z: 0 });
  player.velocity?.set?.(0, 0, 0);
  syncPlayerVisuals(player);
  rememberFeet(player, body, false);
  return { hit: true, type: "crush" };
}

/** @param {object} player Player. @param {object} body Dynamic body. */
function miss(player, body) {
  if (player) rememberFeet(player, body, true);
  return { hit: false, type: null };
}

/** @param {object} player Player. @param {object} body Dynamic body. @param {boolean} decayCarrier Whether to decay support grace. */
function rememberFeet(player, body, decayCarrier) {
  player.__dynamicFeetPreviousY = currentFeetY(player);
  if (!decayCarrier) return;
  if (player.__supportedByDynamicBody !== body) return;
  player.__dynamicCarrierFrames = Math.max(0, Number(player.__dynamicCarrierFrames || 0) - 1);
  if (player.__dynamicCarrierFrames <= 0) player.__supportedByDynamicBody = null;
}
