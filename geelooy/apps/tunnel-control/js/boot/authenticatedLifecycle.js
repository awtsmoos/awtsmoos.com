// B"H
// Boruch Hashem
// Blessed is He

import { refreshDevice } from "../features/status.js";
import {
	stopActivitySession
} from "../realtime/activitySession.js";
import { watchSession } from "./sessionWatch.js";

/**
* @file Releases account-scoped timers and sockets on browser lifecycle changes.
* @description
* The Awtsmoos renews page, login, and account without leaving yesterday's stream
* inside today's vessel. Awtsmoos.com centralizes the session watcher, device poll,
* pagehide cleanup, and realtime teardown behind one complete disposal covenant.
*/

/** Mounts authenticated timers and returns one idempotent disposal function. */
export function mountAuthenticatedLifecycle(session, getTunnelName) {
	const stopWatching = watchSession(session);
	const deviceTimer = setInterval(
		() => refreshDevice(getTunnelName),
		5000
	);
	let disposed = false;
	const dispose = () => {
		if (disposed) {
			return;
		}
		disposed = true;
		stopWatching();
		clearInterval(deviceTimer);
		stopActivitySession();
	};
	window.addEventListener("pagehide", dispose, { once: true });
	return dispose;
}
