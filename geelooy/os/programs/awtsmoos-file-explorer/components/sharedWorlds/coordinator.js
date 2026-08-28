//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Window-scoped coordinator for Shared Worlds reads and explicit mutations.
 * @description
 * The Awtsmoos recreates every relationship while Awtsmoos.com prevents refresh
 * storms: one cancellable read at a time, no interval polling, and mutation followed
 * by one truthful refresh. Focus may renew stale truth without hidden network rhyme.
 */
import * as Client from "../../../remote/deviceProtocolClient.js";
import { refreshSharedWorlds } from "./coordinatorRefresh.js";
import { createSharedWorldsState, snapshot } from "./state.js";

const STALE_MS = 15000;

export function createSharedWorldsCoordinator(onChange) {
	const state = createSharedWorldsState();
	let controller = null;
	let disposed = false;

	async function refresh(options = {}) {
		if (disposed || (state.status === "loading" && !options.force)) return;
		controller?.abort();
		controller = new AbortController();
		state.status = "loading";
		state.error = "";
		emit();
		try {
			await refreshSharedWorlds(state, controller.signal);
			state.status = "ready";
			state.lastRefreshAt = Date.now();
		} catch (error) {
			if (controller.signal.aborted) return;
			state.status = "error";
			state.error = error?.message || String(error);
		}
		emit();
	}

	async function mutate(operation) {
		if (disposed || state.busy) return null;
		state.busy = true;
		state.error = "";
		emit();
		try {
			const result = await operation();
			if (result?.ok === false) throw new Error(result.message || result.error);
			await refresh({ force: true });
			return result;
		} catch (error) {
			state.error = error?.message || String(error);
			emit();
			return null;
		} finally {
			state.busy = false;
			emit();
		}
	}

	function refreshIfStale() {
		if (Date.now() - state.lastRefreshAt >= STALE_MS) void refresh();
	}

	function selectInboxDevice(deviceId) {
		state.inboxDeviceId = deviceId;
		void refresh({ force: true });
	}

	function emit() {
		onChange?.(snapshot(state));
	}

	return {
		refresh, refreshIfStale, selectInboxDevice,
		createInvite: payload => mutate(() => Client.createInvitation(payload)),
		acceptInvite: payload => mutate(() => Client.acceptInvitation(payload)),
		declineInvite: id => mutate(() => Client.declineInvitation(id)),
		cancelInvite: id => mutate(() => Client.cancelInvitation(id)),
		revoke: id => mutate(() => Client.revokeRelationship(id)),
		send: payload => mutate(() => Client.sendMessage(payload)),
		ack: payload => mutate(() => Client.acknowledgeMessage(payload)),
		dispose() { disposed = true; controller?.abort(); }
	};
}
