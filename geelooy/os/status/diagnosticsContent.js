// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers OS evidence into pure titled records before any DOM is
 * created, so Awtsmoos.com diagnostics remain readable and independently testable.
 */

/**
 * Builds diagnostics records.
 *
 * @param {object} os OS runtime.
 * @param {object} status Current OS status.
 * @returns {{title:string, body:string}[]} Diagnostics records.
 */
export function buildDiagnosticRecords(os, status = {}) {
	return [
		record("Local IndexedDB", indexedDbText(status)),
		record("Alias", status.alias || "No alias selected"),
		record("Login status", loginText(status)),
		record("Tunnel status", tunnelText(status)),
		record("Mounted drives", mountedDrivesText(os)),
		record("Graph statistics", graphStatisticsText(os)),
		record("Last sync", lastSyncText(os)),
		record("Pending operations", pendingOperationsText(os))
	];
}

function record(title, body) {
	return {
		title,
		body
	};
}

function indexedDbText(status) {
	return status.mode === "local"
		? "Active private browser storage"
		: "Active, synced alias available";
}

function loginText(status) {
	return status.alias
		? "Logged in / alias remembered"
		: "Local mode / reconnect needed";
}

function tunnelText(status) {
	const tunnel = status.tunnel;
	if (!tunnel) {
		return status.remote || "Unknown";
	}
	return [
		`${tunnel.label} · ${tunnel.name || tunnel.vesselType}`,
		tunnel.detail,
		tunnel.sessionId ? `Session ${tunnel.sessionId}` : "No session reported"
	].join("\n");
}

function mountedDrivesText(os) {
	const mounts = os?.vfs?.mounts?.() || [];
	if (!mounts.length) {
		return "None";
	}
	return mounts.map(function formatMount(mount = {}) {
		return [
			mount.id || "mount",
			mount.adapterId || "adapter",
			mount.prefix || "/",
			mount.syncState || "local"
		].join(" · " );
	}).join("\n");
}

function graphStatisticsText(os) {
	const objects = os?.graph?.list?.().length || 0;
	const events = os?.graph?.history?.({ limit: 200 })?.length || 0;
	return `${objects} objects\n${events} recent events`;
}

function lastSyncText(os) {
	return os?.lastSyncAt
		? new Date(os.lastSyncAt).toLocaleString()
		: "Never";
}

function pendingOperationsText(os) {
	const pending = os?.pendingOperations || [];
	if (!pending.length) {
		return "None";
	}
	return pending.map(function formatPending(item) {
		return `${item.type}:${item.path}`;
	}).join("\n");
}
