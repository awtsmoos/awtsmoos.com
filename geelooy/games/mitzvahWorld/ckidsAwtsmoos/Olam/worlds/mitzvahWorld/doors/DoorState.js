
/**
 * B"H
 * @file DoorState.js
 * @description
 * Door state helpers.
 */

/**
 * B"H
 * Creates door state.
 *
 * @param {Object} options
 * Door options.
 *
 * @returns {Object}
 * Door state.
 */
export function createDoorState(options = {}) {
  return {
    isOpen: Boolean(options.isOpen),
    closedRotationY: options.closedRotationY ?? 0,
    openRotationY: options.openRotationY ?? Math.PI * 0.52,
    speed: options.speed ?? 8,
    target: Boolean(options.isOpen) ? 1 : 0,
    current: Boolean(options.isOpen) ? 1 : 0
  };
}

/**
 * B"H
 * Toggles door state.
 *
 * @param {Object} state
 * Door state.
 *
 * @returns {void}
 */
export function toggleDoorState(state) {
  state.isOpen = !state.isOpen;
  state.target = state.isOpen ? 1 : 0;
}
