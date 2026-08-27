// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Validates and safely projects native and browser tunnel records.
 * @description
 * The Awtsmoos renews received JSON without making appearance into authority.
 * Awtsmoos.com preserves every established compatibility field while adding one
 * bounded health vessel; roots, tools, mailbox internals, limits, and secrets stay
 * concealed. Explicit death remains death, while an omitted legacy liveness field
 * may not erase an explicitly connected verified vessel from the living world.
 */

import { sanitizeDeviceHealth } from "./deviceHealth.js";

export function isTrustedNativeDevice(device = {}) {
	const type = vesselType(device);
	return ["native", "native-tunnel"].includes(type) &&
		device.ownershipVerified === true &&
		Number(device.pairingProofVersion) === 1 &&
		Boolean(text(device.tunnelId)) &&
		Boolean(text(device.deviceId)) &&
		Boolean(text(device.tunnelName)) &&
		["owned", "shared"].includes(device.access) &&
		Array.isArray(device.permissions);
}

export function isTrustedBrowserDevice(device = {}) {
	const type = vesselType(device);
	return ["browser", "browser-tab", "browser-tunnel"].includes(type) &&
		device.ownershipVerified === true &&
		Boolean(text(device.tunnelName)) &&
		device.access === "owned";
}

export function sanitizeNativeDevice(device) {
	if (!isTrustedNativeDevice(device)) {
		return null;
	}
	return Object.freeze({
		connected: device.connected === true,
		isAlive: device.isAlive !== false,
		routeReference: text(device.routeReference || device.tunnelId),
		tunnelId: text(device.tunnelId),
		tunnelName: text(device.tunnelName),
		deviceId: text(device.deviceId),
		deviceName: text(device.deviceName) || "Tunnel Device",
		platform: text(device.platform) || "unknown",
		agentVersion: text(device.agentVersion) || null,
		capabilities: sanitizeCapabilities(device.capabilities),
		health: sanitizeDeviceHealth(device),
		access: device.access,
		shared: device.access === "shared",
		role: text(device.role) || "owner",
		permissions: sanitizePermissions(device.permissions),
		permissionVersion: number(device.permissionVersion, 1),
		revocationVersion: number(device.revocationVersion, 1),
		ownershipVerified: true,
		pairingProofVersion: 1,
		kind: "native",
		vesselType: "native-tunnel"
	});
}

export function sanitizeBrowserDevice(device) {
	if (!isTrustedBrowserDevice(device)) {
		return null;
	}
	const tunnelName = text(device.tunnelName);
	return Object.freeze({
		connected: device.connected !== false,
		isAlive: device.isAlive !== false,
		routeReference: text(device.routeReference || device.tunnelId),
		tunnelId: text(device.tunnelId),
		tunnelName,
		deviceId: text(device.deviceId),
		deviceName: text(device.deviceName) || tunnelName || "Browser session",
		capabilities: sanitizeCapabilities(device.capabilities),
		health: sanitizeDeviceHealth(device),
		access: "owned",
		shared: false,
		role: "session",
		permissions: sanitizePermissions(device.permissions),
		ownershipVerified: true,
		kind: "browser",
		vesselType: "browser-tab"
	});
}

export function sanitizeCapabilities(value = {}) {
	return Object.freeze({
		browserControl: value.browserControl === true,
		commandRun: value.commandRun === true,
		fsRead: value.fsRead === true,
		fsWrite: value.fsWrite === true,
		runtime: value.runtime === true
	});
}

function sanitizePermissions(value) {
	return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

function vesselType(device) {
	return String(device.vesselType || device.kind || "").toLowerCase();
}

export function text(value) {
	return String(value || "").trim().slice(0, 180);
}

export function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
