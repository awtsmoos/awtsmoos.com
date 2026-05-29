// B"H
/**
 * @file movingSolidSolver.js
 * @description Chapter 58: The Awtsmoos sharpens the stone's boundary until
 * invisible buffer becomes truth. Side shove resolves exact AABB contact; crush
 * never teleports unless a body explicitly asks for it.
 */
import { boxFromCenter, boxesOverlap, pointInPathBox, sweptBox } from "./aabb.js";
import { currentFeetY, playerAabb, playerPosition, snapFeetToTop, syncPlayerVisuals, translatePlayer } from "./playerCapsuleBox.js";

const EPS = 0.0005;
const TOP_TOLERANCE = 0.05;

/** @param {object} body Runtime body. @param {object} player Chossid-like player. */
export function solveMovingSolid(body, player) {
  const pos = playerPosition(player);
  if (!body || !player || !pos || !pointInPathBox(pos, body.pathBox)) return miss(player);
  const playerBox = playerAabb(player);
  if (!playerBox) return miss(player);
  const swept = sweptToBox(sweptBox(body.previousPosition, body.position, body.halfExtents));
  if (!boxesOverlap(swept, playerBox)) return miss(player);
  if (landedOnTop(body, player, playerBox)) return supportTop(body, player);
  const bodyBox = boxFromCenter(body.position, body.halfExtents);
  if (boxesOverlap(bodyBox, playerBox)) return pushSide(body, player, bodyBox, playerBox);
  return miss(player);
}

/** @param {object} swept Swept fields. */
function sweptToBox(swept) {
  return {
    minX: swept.sweptMinX,
    maxX: swept.sweptMaxX,
    minY: swept.sweptMinY,
    maxY: swept.sweptMaxY,
    minZ: swept.sweptMinZ,
    maxZ: swept.sweptMaxZ
  };
}

/** @param {object} body Dynamic body. @param {object} player Player. @param {object} pbox Player box. */
function landedOnTop(body, player, pbox) {
  const previousFeet = player.__dynamicFeetPreviousY ?? currentFeetY(player);
  const feetNow = currentFeetY(player);
  const previousTop = body.previousPosition.y + body.halfExtents.y;
  const topNow = body.position.y + body.halfExtents.y;
  const insideXZ = pbox.maxX > body.position.x - body.halfExtents.x &&
    pbox.minX < body.position.x + body.halfExtents.x &&
    pbox.maxZ > body.position.z - body.halfExtents.z &&
    pbox.minZ < body.position.z + body.halfExtents.z;
  return insideXZ && previousFeet > previousTop && feetNow <= topNow + TOP_TOLERANCE;
}

/** @param {object} body Dynamic body. @param {object} player Player. */
function supportTop(body, player) {
  snapFeetToTop(player, body.position.y + body.halfExtents.y);
  translatePlayer(player, { x: body.velocity.x, y: 0, z: body.velocity.z });
  if (player.velocity) player.velocity.y = 0;
  player.onFloor = true;
  syncPlayerVisuals(player);
  player.__dynamicFeetPreviousY = body.position.y + body.halfExtents.y + EPS;
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
  rememberFeet(player);
  return { hit: true, type: push.face };
}

/** @param {object} bodyBox Moving box. @param {object} playerBox Player box. */
function nearestFacePush(bodyBox, playerBox) {
  const leftDepth = playerBox.maxX - bodyBox.minX;
  const rightDepth = bodyBox.maxX - playerBox.minX;
  const frontDepth = playerBox.maxZ - bodyBox.minZ;
  const backDepth = bodyBox.maxZ - playerBox.minZ;
  const pushes = [
    { face: "left", x: -leftDepth - EPS, y: 0, z: 0, depth: leftDepth },
    { face: "right", x: rightDepth + EPS, y: 0, z: 0, depth: rightDepth },
    { face: "front", x: 0, y: 0, z: -frontDepth - EPS, depth: frontDepth },
    { face: "back", x: 0, y: 0, z: backDepth + EPS, depth: backDepth }
  ];
  pushes.sort((a, b) => a.depth - b.depth);
  return pushes[0];
}

/** @param {object} player Player. @param {object} body Dynamic body. */
function crush(player, body) {
  if (typeof player.takeDamage === "function") player.takeDamage(body.crushDamage || 1000);
  else if (typeof player.setPosition === "function") player.setPosition(body.resetPosition || { x: 0, y: 10, z: 0 });
  if (player.velocity?.set) player.velocity.set(0, 0, 0);
  syncPlayerVisuals(player);
  rememberFeet(player);
  return { hit: true, type: "crush" };
}

/** @param {object} player Player. */
function miss(player) {
  if (player) rememberFeet(player);
  return { hit: false, type: null };
}

/** @param {object} player Player. */
function rememberFeet(player) {
  player.__dynamicFeetPreviousY = currentFeetY(player);
}
