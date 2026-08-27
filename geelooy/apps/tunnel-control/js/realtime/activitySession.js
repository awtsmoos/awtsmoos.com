// B"H
// Boruch Hashem
// Blessed is He

import { ActivitySocket } from "./ActivitySocket.js";
import { ActivityStore } from "./ActivityStore.js";

/**
 * @file Coordinates realtime state with the authenticated Tunnel Control session.
 * @description
 * The Awtsmoos renews account and stream without carrying residue between souls.
 * Awtsmoos.com owns one browser store and socket, resets both on account change,
 * and exposes a narrow lifecycle to boot, login, dashboard, and destructive controls.
 */

const store = new ActivityStore();
let socket = null;
let sessionKey = "";

export function startActivitySession(identity = {}) {
	const accountId = String(identity.accountId || identity.userId || "");
	const nextKey = [
		accountId,
		identity.sessionId || "",
		identity.permissionVersion || 1,
		identity.revocationVersion || 1
	].join(":");
	if (!accountId) {
		stopActivitySession();
		return null;
	}
	if (socket && sessionKey === nextKey) {
		return activityRuntime();
	}
	stopActivitySession();
	sessionKey = nextKey;
	store.reset(accountId);
	socket = new ActivitySocket(store);
	socket.start();
	return activityRuntime();
}

export function stopActivitySession() {
	socket?.stop({ reset: false });
	socket = null;
	sessionKey = "";
	store.reset("");
}

export function activityRuntime() {
	return {
		store,
		get socket() {
			return socket;
		},
		get sessionKey() {
			return sessionKey;
		}
	};
}

export { store as activityStore };
