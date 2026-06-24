// B"H

import { createMissionRoomsView } from "./missionRooms/view.js";
import { createRoomController } from "./missionRooms/controller.js";

/**
 * B"H
 * Chapter 706: The monolith bowed and became a doorway.
 *
 * Mission Rooms now exports the same public shape, while the chamber's body,
 * memory, bridge, rendering, and heartbeat controller live in smaller vessels.
 */
export function missionRooms() {
  return createMissionRoomsView();
}

export function mountMissionRooms(getTunnelName) {
  if (!document.getElementById("discoverRoomsBtn")) return;
  createRoomController(getTunnelName).mount();
}
