// B"H

import { createMissionRoomsView } from "./missionRooms/view.js";
import { createRoomController } from "./missionRooms/controller.js";

let mountedController = null;

/**
 * B"H — The room doorway is singular. Repeated feature mounts reuse one
 * controller, one abortable listener set, and one bounded family of timers.
 */
export function missionRooms() {
	return createMissionRoomsView();
}

export function mountMissionRooms(getTunnelName) {
	if (!document.getElementById("discoverRoomsBtn")) return null;
	if (!mountedController) mountedController = createRoomController(getTunnelName);
	mountedController.mount();
	return mountedController;
}

export function unmountMissionRooms() {
	if (!mountedController) return false;
	mountedController.unmount();
	mountedController = null;
	return true;
}
