//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parallel cancellable discovery for account tunnels and transient preview worlds.
 * @description
 * The Awtsmoos lets devices and previews be revealed through independent network
 * vessels at one moment. Awtsmoos.com gathers both in parallel, honors cancellation,
 * and reconciles completed truth so stale requests and stale snapshots cannot rhyme.
 */
import * as Client from "../remote/tunnelControlClient.js";
import { syncRemoteDrives } from "./remoteDriveSync.js";
import { syncRemotePreviews } from "./remotePreviewSync.js";

/**
 * Refreshes one DriveRegistry from independent tunnel and preview endpoints.
 *
 * @param {object} registry DriveRegistry receiving discovered worlds.
 * @param {object} options Request options including AbortSignal/timeouts/retries.
 * @returns {Promise<object>} Device, preview, and cancellation result.
 */
export async function refreshRemoteRegistry(registry, options = {}) {
	const [devices, previews] = await Promise.all([
		Client.devices(options).catch(error => failure(error, "device_discovery_failed")),
		Client.previewList(options).catch(error => failure(error, "preview_discovery_failed"))
	]);
	if (options.signal?.aborted) {
		return {
			devices,
			previews,
			cancelled: true
		};
	}
	if (devices.ok !== false) {
		syncRemoteDrives(registry, devices);
	}
	if (previews.ok !== false) {
		syncRemotePreviews(registry, previews.previews || []);
	}
	registry.lastRefresh = Date.now();
	return {
		devices,
		previews,
		cancelled: false
	};
}

function failure(error, code) {
	return {
		ok: false,
		error: code,
		message: error?.message || String(error)
	};
}
