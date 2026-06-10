// B"H
/**
 * @file SpikeResetPosition.js
 * @description
 * Chapter 639: The lava return no longer remembers an ancient island.
 *
 * The Awtsmoos renews every coordinate from nothing into now, and this tiny
 * vessel follows that lesson with practical obedience: reset feet are read
 * from the active level payload first, from the living player's original
 * authored spawn second, and from a single honest fallback only at the end.
 * The old hard-coded memory dragged later lava courses under the world; this
 * resolver listens to the course that is actually burning beneath the player.
 */

/** @type {{x:number,y:number,z:number}} */
export const DEFAULT_SPIKE_RESET_FEET = Object.freeze({ x: -22, y: 1.78, z: 0 });

const PAYLOAD_KEYS = Object.freeze([
  "position",
  "resetPosition",
  "targetPosition",
  "startFeet",
  "spawnFeet"
]);

/**
 * Turns a trembling value into a finite number or returns null.
 *
 * @param {unknown} value - Candidate coordinate component.
 * @returns {number|null} The finite coordinate, or null when the vessel is air.
 */
function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * Reads vector-like objects, including old `{ vector3() }` wrappers.
 *
 * @param {unknown} value - Possible `{x,y,z}` record or vector wrapper.
 * @returns {{x:number,y:number,z:number}|null} Normalized feet position.
 */
export function normalizeResetFeet(value) {
  const raw = typeof value?.vector3 === "function" ? value.vector3() : value;
  const x = finiteOrNull(raw?.x);
  const y = finiteOrNull(raw?.y);
  const z = finiteOrNull(raw?.z);
  return x === null || y === null || z === null ? null : { x, y, z };
}

/**
 * Finds a reset coordinate inside a lava death payload.
 *
 * @param {object} [payload={}] - UI or worker reset payload.
 * @returns {{x:number,y:number,z:number}|null} Authored feet from the payload.
 */
export function resetFeetFromPayload(payload = {}) {
  for (const key of PAYLOAD_KEYS) {
    const feet = normalizeResetFeet(payload?.[key]);
    if (feet) return feet;
  }
  const nested = normalizeResetFeet(payload?.reset?.position || payload?.reset?.feet);
  return nested || null;
}

/**
 * Recovers the Chossid's original authored spawn if no payload arrived.
 *
 * @param {object|null|undefined} player - Runtime Chossid-like body.
 * @returns {{x:number,y:number,z:number}|null} Authored player feet.
 */
export function resetFeetFromPlayer(player) {
  return normalizeResetFeet(player?.originalOptions?.position) ||
    normalizeResetFeet(player?.options?.position) ||
    normalizeResetFeet(player?.__spawnPosition);
}

/**
 * Resolves reset feet from payload, world memory, player data, then fallback.
 *
 * @param {object} [payload={}] - Reset payload sent by the overlay.
 * @param {object|null} [olam=null] - Runtime world, when available.
 * @returns {{x:number,y:number,z:number}} Safe lava reset feet.
 */
export function resolveSpikeResetFeet(payload = {}, olam = null) {
  const player = olam?.chossid || olam?.player ||
    olam?.nivrayim?.find?.(nivra => nivra?.type === "chossid");
  return resetFeetFromPayload(payload) ||
    normalizeResetFeet(olam?.__awtsmoosLevelStartFeet) ||
    resetFeetFromPlayer(player) ||
    { ...DEFAULT_SPIKE_RESET_FEET };
}
