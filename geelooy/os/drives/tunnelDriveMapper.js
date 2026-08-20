// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps verified remote devices and previews into OS drive records.
 * @description
 * The Awtsmoos lets the title remain warm and human while the mounted root is
 * bound to immutable route identity. Awtsmoos.com keeps vessel kind beside the
 * route as a routing hint only; it never becomes the address and never grants
 * capability by itself. One bond below, many garments above — Blessed is He.
 */

import { remoteDriveIdentity } from "./remoteDriveIdentity.js";

export function deviceDrive(device = {}) {
	const vesselType = vesselTypeFor(device);
	const provider = vesselType === "virtual-os" ? "virtual" : "tunnel";
	const identity = remoteDriveIdentity(device);
	const canRead = device.capabilities?.fsRead === true || device.allowRead === true;
	const canWrite = device.capabilities?.fsWrite === true || device.allowWrite === true;
	const canCommand = device.capabilities?.commandRun === true || device.allowCommands === true;
	const targetVessel = targetVesselFor(vesselType);
	return {
		...identity,
		url: provider === "tunnel"
			? `awtsmoos://tunnels/${encodeURIComponent(identity.routeReference)}`
			: `awtsmoos://network/${encodeURIComponent(identity.routeReference)}`,
		icon: provider === "virtual" ? "☁️" : "💻",
		kind: provider,
		provider,
		writable: canWrite,
		canRead,
		canWrite,
		canCommand,
		commandEnabled: canCommand,
		targetVessel,
		vesselType,
		dynamicTunnelDrive: provider === "tunnel",
		device
	};
}

export function previewDrive(preview = {}) {
	return {
		id: `preview-${preview.id}`,
		title: preview.title || preview.id,
		root: `/system/previews/${preview.id}`,
		url: `awtsmoos://preview/${preview.id}`,
		icon: "🔭",
		kind: "preview",
		provider: "preview",
		providerId: "preview",
		writable: false,
		preview
	};
}

export function receiptDrive() {
	return {
		id: "mission-receipts",
		title: "Mission Receipts",
		root: "/system/receipts",
		url: "awtsmoos://receipt/missions",
		icon: "🧾",
		kind: "receipt",
		provider: "receipt",
		writable: false
	};
}

export function targetVesselFor(vesselType = "") {
	if (vesselType === "virtual-os") {
		return "virtual-os";
	}
	if (["browser", "browser-tab", "browser-tunnel"].includes(vesselType)) {
		return "browser-tab";
	}
	return "native-tunnel";
}

function vesselTypeFor(device) {
	return String(
		device.vesselType ||
		device.kind ||
		(device.syntheticTunnel ? "virtual-os" : "native-tunnel")
	).toLowerCase();
}
