//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stable remote-drive fingerprints and event publication for low-churn OS refreshes.
 * @description
 * The Awtsmoos renews every distant vessel while unchanged visible truth may remain
 * peacefully still. Awtsmoos.com compares only presentation-relevant remote state,
 * assigns fresh telemetry silently, and emits events only when useful change enters rhyme.
 */

/**
 * Returns the current live dynamic tunnel drive records.
 *
 * @param {object} os Geelooy OS instance.
 * @returns {Array<object>} Current dynamic tunnel drives.
 */
export function liveTunnelDrives(os) {
	return (os?.drives?.list?.() || []).filter(drive => {
		return drive.dynamicTunnelDrive === true;
	});
}

/**
 * Returns stable live tunnel identifiers for status and topology comparison.
 *
 * @param {object} os Geelooy OS instance.
 * @returns {Array<string>} Sorted dynamic drive ids.
 */
export function liveTunnelIds(os) {
	return liveTunnelDrives(os)
		.map(drive => drive.id)
		.filter(Boolean)
		.sort();
}

/**
 * Builds a deterministic signature of fields that alter visible or permission state.
 *
 * @param {object} os Geelooy OS instance.
 * @returns {string} Stable presentation fingerprint.
 */
export function remoteDriveFingerprint(os) {
	return JSON.stringify(
		liveTunnelDrives(os)
			.map(drive => ({
				id: drive.id || "",
				title: drive.title || "",
				subtitle: drive.subtitle || "",
				permissionState: drive.permissionState || "",
				connectionState: drive.connectionState || "",
				platform: drive.platform || "",
				canRead: drive.canRead === true,
				canWrite: drive.canWrite === true,
				canCommand: drive.canCommand === true
			}))
			.sort((left, right) => left.id.localeCompare(right.id))
	);
}

/**
 * Creates one remote-drive status snapshot while preserving last successful sync time.
 *
 * @param {string} status Status name.
 * @param {object} os Geelooy OS instance.
 * @param {string} lastError Safe visible error copy.
 * @param {object} previous Previous remote-drive state.
 * @returns {object} New immutable-ready state payload.
 */
export function remoteDriveState(status, os, lastError = "", previous = {}) {
	return {
		status,
		driveIds: liveTunnelIds(os),
		lastSuccessAt: status === "ready"
			? Date.now()
			: Number(previous.lastSuccessAt || 0),
		lastError
	};
}

/**
 * Assigns state and optionally broadcasts one window-scoped Explorer event.
 *
 * @param {object} os Geelooy OS instance.
 * @param {object} state Remote-drive state payload.
 * @param {object} options Emission and change metadata.
 * @returns {object} Frozen assigned state.
 */
export function publishRemoteDriveState(os, state, options = {}) {
	const frozen = Object.freeze({ ...state });
	os.remoteDriveState = frozen;
	if (options.emit !== false && typeof CustomEvent === "function") {
		globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:remote-drives", {
			detail: {
				...frozen,
				topologyChanged: options.topologyChanged === true,
				presentationChanged: options.presentationChanged === true
			}
		}));
	}
	return frozen;
}
