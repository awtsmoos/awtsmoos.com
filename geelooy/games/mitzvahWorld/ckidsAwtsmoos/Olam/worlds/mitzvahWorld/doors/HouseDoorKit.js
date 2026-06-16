// B"H
/** @file HouseDoorKit.js @description Shared kit for house doors that open, parser-clear. */
import { createDoorState } from "./DoorState.js?v=awtsmoos-door-state-20260614-bh2";
import { animateDoor } from "./DoorAnimator.js";
import { installDoorInteraction } from "./DoorInteraction.js";
export function attachWorkingHouseDoor(doorObject, doorMesh, options = {}) { const state = createDoorState(options); installDoorInteraction(doorObject, state); const oldHeesHawvoos = doorObject && typeof doorObject.heesHawvoos === "function" ? doorObject.heesHawvoos.bind(doorObject) : null; doorObject.heesHawvoos = dt => { if (oldHeesHawvoos) oldHeesHawvoos(dt); animateDoor(doorMesh, state, dt || .016); }; return state; }
