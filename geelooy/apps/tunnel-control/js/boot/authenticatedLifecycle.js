// B"H
// Boruch Hashem
// Blessed is He

import { myDevice, revokeDevice } from "../api/control.js";
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
	mountAccountActions(getTunnelName);
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

function mountAccountActions(getTunnelName) {
	const logout = document.getElementById("logoutBtn");
	if (logout && logout.dataset.awtBound !== "true") {
		logout.dataset.awtBound = "true";
		logout.addEventListener("click", () => {
			stopActivitySession();
			location.assign(`/logout?next=${encodeURIComponent("/apps/tunnel-control/")}`);
		});
	}
	const revoke = document.getElementById("revokeDeviceBtn");
	if (!revoke || revoke.dataset.awtBound === "true") return;
	revoke.dataset.awtBound = "true";
	revoke.addEventListener("click", async () => {
		const tunnelName = getTunnelName();
		if (!tunnelName || !confirm(`Revoke ${tunnelName} and delete its Mac credentials?`)) return;
		revoke.disabled = true;
		try {
			const discovery = await myDevice();
			const devices = [
				...(discovery.nativeDevices || []),
				...(discovery.devices || [])
			];
			const device = devices.find((entry) => entry.tunnelName === tunnelName);
			if (!device?.tunnelId) throw new Error("verified_device_not_found");
			const result = await revokeDevice(device.tunnelId);
			if (result.ok === false) throw new Error(result.error || "device_revoke_failed");
			location.reload();
		} catch (error) {
			revoke.textContent = `Revoke failed: ${error.message}`;
			revoke.disabled = false;
		}
	});
}
