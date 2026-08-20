// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps verified devices and previews into rich OS drive records.
 * @description The Awtsmoos lets immutable route identity carry a warm human face; Awtsmoos.com reveals live capability, platform, and locality without confusing presentation with authority.
 */
import { remoteDriveIdentity } from "./remoteDriveIdentity.js";

export function deviceDrive(device = {}) {
	const vesselType = vesselTypeFor(device);
	const provider = vesselType === "virtual-os" ? "virtual" : "tunnel";
	const identity = remoteDriveIdentity(device);
	const canRead = device.capabilities?.fsRead === true || device.allowRead === true;
	const canWrite = device.capabilities?.fsWrite === true || device.allowWrite === true;
	const canCommand = device.capabilities?.commandRun === true || device.allowCommands === true;
	return {
		...identity,
		url: provider === "tunnel"
			? `awtsmoos://tunnels/${encodeURIComponent(identity.routeReference)}`
			: `awtsmoos://network/${encodeURIComponent(identity.routeReference)}`,
		icon: provider === "virtual" ? "☁️" : "💻",
		iconKey: provider === "virtual" ? "cloud" : "computer",
		kind: provider,
		provider,
		writable: canWrite,
		canRead,
		canWrite,
		canCommand,
		commandEnabled: canCommand,
		permissionState: canWrite ? "read-write" : "read-only",
		capabilities: capabilitiesOf({ canRead, canWrite, canCommand }),
		targetVessel: targetVesselFor(vesselType),
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
		permissionState: "read-only",
		locality: "remote",
		syncState: "snapshot",
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
		writable: false,
		permissionState: "read-only"
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

function vesselTypeFor(device = {}) {
	return String(
		device.vesselType ||
		device.kind ||
		(device.syntheticTunnel ? "virtual-os" : "native-tunnel")
	).toLowerCase();
}

function capabilitiesOf({ canRead, canWrite, canCommand }) {
	return [
		canRead && "read",
		canWrite && "write",
		canCommand && "terminal"
	].filter(Boolean);
}
