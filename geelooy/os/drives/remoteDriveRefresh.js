//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One complete low-churn remote-drive refresh transaction.
 * @description
 * The Awtsmoos renews distant topology and presentation together while Awtsmoos.com
 * compares before and after truth, records fresh telemetry, and reveals change only
 * when something useful actually shifted, leaving the scheduler free to keep its rhyme.
 */
import {
	liveTunnelIds,
	publishRemoteDriveState,
	remoteDriveFingerprint,
	remoteDriveState
} from "./remoteDriveState.js";

/**
 * Performs one cancellable discovery and publishes only meaningful visible change.
 *
 * @param {object} os Geelooy OS instance.
 * @param {object} previous Previous coordinator state.
 * @param {boolean} announce Whether the user explicitly requested refresh feedback.
 * @param {AbortSignal} signal Cancellation signal owned by the coordinator.
 * @returns {Promise<{result:object,state:object}>} Refresh result and next state.
 */
export async function refreshRemoteDriveWorld(os, previous, announce, signal) {
	const beforeIds = liveTunnelIds(os).join("|");
	const beforeFingerprint = remoteDriveFingerprint(os);
	try {
		const result = await os.drives.refreshRemote({ signal });
		if (signal.aborted || result.cancelled) {
			return { result, state: previous };
		}
		const afterIds = liveTunnelIds(os).join("|");
		const afterFingerprint = remoteDriveFingerprint(os);
		const topologyChanged = beforeIds !== afterIds;
		const presentationChanged = beforeFingerprint !== afterFingerprint;
		recordRemoteRefresh(os, result, topologyChanged);
		const state = remoteDriveState("ready", os, "", previous);
		publishRemoteDriveState(os, state, {
			emit: announce || presentationChanged || previous.status !== "ready",
			topologyChanged,
			presentationChanged
		});
		if (topologyChanged) {
			os.renderDesktop?.();
		}
		if (announce) {
			os.taskbar?.notify?.(`Connected drives: ${state.driveIds.length}`, "success");
		}
		return { result, state };
	} catch (error) {
		if (signal.aborted) {
			return {
				result: { ok: false, cancelled: true },
				state: previous
			};
		}
		const state = remoteDriveState(
			"error",
			os,
			error?.message || String(error),
			previous
		);
		publishRemoteDriveState(os, state);
		return {
			result: { ok: false, error },
			state
		};
	}
}

function recordRemoteRefresh(os, result, changed) {
	os.lastSyncAt = Date.now();
	os.updateStatus(result.devices?.ok === false ? "needs-login" : "ready");
	os.recordGraphEvent?.("remote.refresh", {
		connected: liveTunnelIds(os).length,
		changed
	});
}
