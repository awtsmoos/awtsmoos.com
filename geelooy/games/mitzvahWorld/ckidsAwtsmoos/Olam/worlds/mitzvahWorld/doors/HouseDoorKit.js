
/**
 * B"H
 * @file HouseDoorKit.js
 * @description
 * Shared kit for house doors that actually open.
 */

import { createDoorState } from "./DoorState.js";
import { animateDoor } from "./DoorAnimator.js";
import { installDoorInteraction } from "./DoorInteraction.js";

/**
 * B"H
 * Makes a door interactive and animated.
 *
 * @param {Object} doorObject
 * Door object.
 *
 * @param {any} doorMesh
 * Door mesh.
 *
 * @param {Object} options
 * Door options.
 *
 * @returns {Object}
 * Door state.
 */
export function attachWorkingHouseDoor(doorObject, doorMesh, options = {}) {
  const state = createDoorState(options);

  installDoorInteraction(doorObject, state);

  const oldHeesHawvoos = doorObject.heesHawvoos?.bind(doorObject);

  doorObject.heesHawvoos = dt => {
    if (oldHeesHawvoos) oldHeesHawvoos(dt);
    animateDoor(doorMesh, state, dt || 0.016);
  };

  return state;
}
