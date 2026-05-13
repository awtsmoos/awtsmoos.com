
/**
 * B"H
 * @file MaterialLogPolicy.js
 * @description
 * Shared material log policy.
 */

/**
 * B"H
 * Set true in console for deep shader debugging.
 */
export const MATERIAL_DEBUG_ENABLED = false;

/**
 * B"H
 * Logs shader/material debug only when enabled.
 *
 * @param {string} text
 * Text.
 *
 * @returns {void}
 */
export function materialDebug(text) {
  if (MATERIAL_DEBUG_ENABLED) {
    console.info(text);
  }
}

/**
 * B"H
 * Logs material errors.
 *
 * @param {string} text
 * Text.
 *
 * @returns {void}
 */
export function materialError(text) {
  console.error(text);
}
