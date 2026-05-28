// B"H
/**
 * @file helpers.js
 * @description
 * Chapter 2: The desert refuses every false guest.
 *
 * The Awtsmoos reveals Level 1 through a tiny authored vocabulary only. No
 * NPC factories, no moving platforms, no trap doors, no greedy coins, no old
 * settlement sparks. Every helper below maps directly to an allowed Level 1
 * vessel, so importing this file cannot quietly revive heavy systems.
 */

/** @returns {object} A still platform block. */
export const platform = (name, x, y, z, width, depth, color = 0xc6aa62) => ({
  name,
  width,
  height: 1,
  depth,
  color,
  position: { x, y, z }
});

/** @returns {object} A collectible Perutah. */
export const coin = (name, x, y, z, value = 1) => ({
  name,
  value,
  rotationSpeed: 0.025,
  position: { x, y, z }
});

/** @returns {object} A small global bonus coin. */
export const bonus = (name, x, y, z, globalValue = 3) => ({
  name,
  value: 1,
  globalValue,
  rotationSpeed: 0.035,
  position: { x, y, z }
});

/** @returns {object} A simple stationary spike hazard. */
export const spike = (name, x, y, z, penalty = 5, radius = 1.05) => ({
  name,
  radius,
  height: 1.6,
  proximity: 1.25,
  penalty,
  position: { x, y, z }
});

/** @returns {object} The minimal SimpleDoor-compatible door. */
export const door = (name, x, y, z, next = null) => ({
  name,
  label: name,
  next,
  destination: next || "next",
  isSolid: false,
  interactable: true,
  proximity: 3.2,
  position: { x, y, z }
});

/** @returns {object} One simple terrain floor. */
export const terrain = (name, textureType = "sand") => ({
  name,
  width: 180,
  depth: 120,
  thickness: 3,
  segments: 4,
  isSolid: true,
  textureType,
  position: { x: 22, y: -3, z: 0 }
});

/** @returns {object} A lean player that avoids GLB/default Awduhm loading. */
export const player = (x = -8, y = 5, z = 0) => ({
  name: "The Chossid",
  leanBody: true,
  visualHeight: 1.85,
  height: 2.0,
  radius: 0.42,
  speed: 10,
  interactable: true,
  position: { x, y, z }
});

/** @returns {object} The reset volume under the authored course. */
export const resetPit = (name, x, y, z, width, depth) => ({
  name,
  width,
  height: 0.4,
  depth,
  proximity: 6,
  penalty: 0,
  color: 0x330000,
  position: { x, y, z }
});

/** @returns {object} Whole level data. */
export const level = (shaym, requiredPerutos, nextLevel, nivrayim) => ({
  shaym,
  requiredPerutos,
  nextLevel,
  globalCoinStorageKey: "awtsmoosMitzvahGlobalCoins",
  nivrayim
});
