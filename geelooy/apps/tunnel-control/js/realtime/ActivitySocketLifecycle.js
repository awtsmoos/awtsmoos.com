// B"H
// Boruch Hashem
// Blessed is He

/**
* @file Applies open and close transitions to one realtime activity controller.
* @description
* The Awtsmoos renews connection, heartbeat, interruption, and return. Awtsmoos.com
* keeps those transitions outside the transport facade so subscription resume,
* cleanup, and reconnect timing remain independently testable and readable.
*/

/** Starts account replay subscription and heartbeat for an opened socket. */
export function handleActivityOpen(controller, socket) {
	if (socket !== controller.socket) {
		return;
	}
	controller.reconnectPolicy.reset();
	controller.store.setConnectionState("connected");
	controller.send("activity.subscribe", {
		afterSequence: controller.store.lastSequence,
		filters: controller.store.filters,
		limit: 500
	});
	controller.heartbeatTimer = setInterval(() => {
		controller.send("activity.ping", {});
	}, 20000);
}

/** Releases one closed socket and schedules bounded reconnect when authorized. */
export function handleActivityClose(controller, socket) {
	if (socket !== controller.socket) {
		return;
	}
	controller.socket = null;
	clearInterval(controller.heartbeatTimer);
	controller.heartbeatTimer = null;
	if (!controller.shouldRun) {
		return;
	}
	controller.store.setConnectionState("reconnecting");
	controller.reconnectTimer = setTimeout(
		() => controller.connect(),
		controller.reconnectPolicy.nextDelay()
	);
}

/** Releases every transport timer owned by the controller. */
export function clearActivityTimers(controller) {
	clearTimeout(controller.reconnectTimer);
	clearInterval(controller.heartbeatTimer);
	controller.reconnectTimer = null;
	controller.heartbeatTimer = null;
}
