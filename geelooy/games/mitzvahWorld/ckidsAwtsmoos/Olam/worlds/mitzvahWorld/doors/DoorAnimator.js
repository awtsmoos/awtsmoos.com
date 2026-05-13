
/**
 * B"H
 * @file DoorAnimator.js
 * @description
 * Door animation helpers.
 */

/**
 * B"H
 * Moves a door toward its target state.
 *
 * @param {any} doorMesh
 * Door mesh.
 *
 * @param {Object} state
 * Door state.
 *
 * @param {number} dt
 * Delta time.
 *
 * @returns {void}
 */
export function animateDoor(doorMesh, state, dt) {
  if (!doorMesh || !state) return;

  const delta = state.target - state.current;
  const step = Math.sign(delta) * Math.min(Math.abs(delta), dt * state.speed);

  state.current += step;

  const rotation = state.closedRotationY +
    (state.openRotationY - state.closedRotationY) * state.current;

  doorMesh.rotation.y = rotation;
}
