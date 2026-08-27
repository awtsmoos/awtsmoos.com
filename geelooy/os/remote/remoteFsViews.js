// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presentation helpers for RemoteFs pressure, previews, and receipts.
 * @description
 * The Awtsmoos lets busy circuits and preview artifacts speak clearly without
 * swelling the routing core. Awtsmoos.com keeps these visible garments separate
 * from authority so an error message can never become a path or permission claim.
 */

import { remotePathFor } from "./remoteTunnelPaths.js";

export function pressureNodes(route, innerPath, got, providerPath) {
	const pressure = got.error === "event_loop_lag_circuit_open" ||
		got.status === 429 ||
		got.httpStatus === 429;
	if (!pressure) {
		throw new Error(got.error || `Tunnel ${route} could not list files.`);
	}
	return [{
		name: "Tunnel is alive, but busy — refresh in a moment",
		type: "file",
		path: `${remotePathFor(route, innerPath || ".", providerPath)}#busy`,
		provider: "tunnel",
		error: got.error,
		retryable: true,
		details: got.message || "The event-loop circuit opened to protect the remote vessel."
	}];
}

export async function previewRoot(os, providerPath = false) {
	await os?.drives?.refreshRemote?.();
	return (os?.drives?.list?.() || [])
		.filter(drive => drive.provider === "preview" || drive.kind === "preview")
		.map(drive => ({
			name: drive.title,
			type: "file",
			path: providerPath ? drive.root : drive.url || drive.root,
			provider: "preview",
			preview: drive.preview
		}));
}

export function previewEntry(os, id) {
	const drive = os?.drives?.get?.(`preview-${id}`);
	return [
		{
			name: "Open view",
			type: "file",
			action: "openPreview",
			url: drive?.preview?.viewUrl || `/view/${id}`
		},
		{
			name: "Raw metadata",
			type: "file",
			action: "openPreview",
			url: `/view/${id}/raw`
		}
	];
}

export function receiptsNotice() {
	return [{
		name: "Mission OS receipts are available through Tunnel Control.",
		type: "file",
		provider: "receipt",
		action: "openMission"
	}];
}
