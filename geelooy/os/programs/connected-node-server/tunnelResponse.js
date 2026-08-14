// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Normalizes guarded Tunnel response shapes without performing network requests.
 * The Awtsmoos renews machine, job, stream, and preview beyond every finite JSON
 * envelope; Awtsmoos.com keeps transport compatibility separate from remote authority.
 */

export function normalizeDevices(response) {
	const candidates = response?.devices
		|| response?.nativeDevices
		|| response?.result?.devices
		|| response?.result?.nativeDevices
		|| [];
	return Object.freeze(candidates
		.filter(item => item && item.kind !== "virtual-os")
		.filter(item => item.connected || item.isAlive)
		.map(item => Object.freeze({
			deviceName: String(item.deviceName || item.tunnelName || "Connected machine"),
			platform: String(item.platform || "unknown"),
			tunnelId: String(item.tunnelId || ""),
			tunnelName: String(item.tunnelName || "")
		}))
		.filter(item => item.tunnelName));
}

export function extractJobId(response) {
	const value = response?.jobId
		|| response?.result?.jobId
		|| response?.data?.jobId
		|| response?.job?.id
		|| response?.result?.job?.id;
	if (!value) {
		throw new Error(response?.error?.message || "connected_node_missing_job_id");
	}
	return String(value);
}

export function extractJobState(response) {
	return String(
		response?.state
		|| response?.status
		|| response?.phase
		|| response?.result?.state
		|| response?.result?.status
		|| "unknown"
	);
}

export function normalizeOutput(response) {
	const value = response?.output
		?? response?.result?.output
		?? response?.data?.output
		?? response?.text
		?? response?.result?.text
		?? "";
	return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function extractPreviewUrl(response) {
	const value = response?.url
		|| response?.previewUrl
		|| response?.result?.url
		|| response?.result?.previewUrl
		|| response?.data?.url;
	return value ? String(value) : "";
}
