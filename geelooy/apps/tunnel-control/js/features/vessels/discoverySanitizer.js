// B"H
// Boruch Hashem
// Blessed is He

import {
	number,
	sanitizeBrowserDevice,
	sanitizeNativeDevice,
	text
} from "./deviceContract.js";

export const VIRTUAL_OS_TUNNEL = "awtsmoos-virtual-os";

/**
 * @file Converts any device endpoint response into one fail-closed browser model.
 * @description
 * The Awtsmoos renews endpoint and interface without letting stale server shapes
 * select a foreign machine. Awtsmoos.com drops malformed records, records their
 * removal, and treats a safe Virtual OS fallback as a usable discovery result.
 */
export function sanitizeDiscoveryResponse(raw = {}) {
	const nativeSource = array(raw.nativeDevices || raw.tunnels);
	const browserSource = array(raw.browserDevices);
	const nativeDevices = nativeSource.map(sanitizeNativeDevice).filter(Boolean);
	const browserDevices = browserSource.map(sanitizeBrowserDevice).filter(Boolean);
	const virtualDevice = sanitizeVirtualDevice(raw.virtualDevice);
	const accountDevices = [...browserDevices, ...nativeDevices];
	const recommended = safeRecommendation(
		raw.recommended || raw.device || raw.tunnel,
		accountDevices,
		virtualDevice
	);
	const removed = nativeSource.length - nativeDevices.length +
		browserSource.length - browserDevices.length;
	return Object.freeze({
		BH: "B\"H",
		ok: Boolean(recommended),
		sourceOk: raw.ok !== false,
		identity: sanitizeIdentity(raw.identity),
		nativeDevices,
		browserDevices,
		virtualDevice,
		devices: virtualDevice
			? [...accountDevices, virtualDevice]
			: accountDevices,
		recommended,
		device: recommended,
		tunnel: recommended,
		tunnelName: recommended?.tunnelName || "",
		warnings: warningsFor(raw, removed),
		error: recommended ? "" : text(raw.error) || "no_verified_device"
	});
}

function safeRecommendation(candidate, devices, virtualDevice) {
	const key = text(candidate?.tunnelId || candidate?.tunnelName);
	return devices.find((device) => {
		return device.tunnelId === key || device.tunnelName === key;
	}) || devices.find((device) => device.connected) || virtualDevice || null;
}

function sanitizeVirtualDevice(device) {
	if (device === null) {
		return null;
	}
	const tunnelName = text(device?.tunnelName) || VIRTUAL_OS_TUNNEL;
	if (tunnelName !== VIRTUAL_OS_TUNNEL) {
		return null;
	}
	return Object.freeze({
		tunnelName: VIRTUAL_OS_TUNNEL,
		deviceName: "Awtsmoos Virtual OS",
		connected: true,
		isAlive: true,
		access: "owned",
		permissions: ["tunnel.read", "tunnel.write", "tunnel.command"],
		ownershipVerified: true,
		kind: "virtual-os",
		vesselType: "virtual-os"
	});
}

function sanitizeIdentity(identity = {}) {
	return Object.freeze({
		accountId: text(identity.accountId),
		userId: text(identity.userId),
		sessionId: text(identity.sessionId),
		issuer: text(identity.issuer),
		subject: text(identity.subject),
		permissionVersion: number(identity.permissionVersion, 1),
		revocationVersion: number(identity.revocationVersion, 1)
	});
}

function warningsFor(raw, removed) {
	const warnings = array(raw.warnings).map(text).filter(Boolean);
	if (removed) {
		warnings.push("unverified_device_records_removed");
	}
	if (raw.ok === false && raw.error) {
		warnings.push(`source_${text(raw.error)}`);
	}
	return [...new Set(warnings)];
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
