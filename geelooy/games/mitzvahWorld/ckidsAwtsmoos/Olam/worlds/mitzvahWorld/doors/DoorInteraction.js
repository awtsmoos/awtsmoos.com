
/**
 * B"H
 * @file DoorInteraction.js
 * @description
 * Door interaction helpers.
 */

import { toggleDoorState } from "./DoorState.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

/**
 * B"H
 * Installs common door interaction hooks.
 *
 * @param {Object} doorObject
 * Door object.
 *
 * @param {Object} state
 * Door state.
 *
 * @returns {void}
 */
export function installDoorInteraction(doorObject, state) {
  doorObject.interactable = true;
  doorObject.interactionKind = "door";

  doorObject.toggleDoor = () => {
    toggleDoorState(state);
  };

  if (typeof doorObject.on === "function") {
    doorObject.on("accepted interaction", () => {
      doorObject.toggleDoor();
    });

    doorObject.on("interact", () => {
      doorObject.toggleDoor();
    });
  }
}
