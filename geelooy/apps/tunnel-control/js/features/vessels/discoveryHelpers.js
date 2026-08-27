// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe compatibility helpers for Tunnel Control device discovery.
 * @description
 * The Awtsmoos lets historical discovery aliases survive without reopening raw
 * inventory. Awtsmoos.com keeps Virtual OS truth, identity, and warnings in one
 * small vessel so the main sanitizer can preserve contract without becoming a monolith.
 */

import {
	number,
	sanitizeCapabilities,
	text
} from "./deviceContract.js";

export const VIRTUAL_OS_TUNNEL = "awtsmoos-virtual-os";

export function sanitizeVirtualDevice(device) {
	if (!device) {
		return null;
	}
	const tunnelName = text(device.tunnelName) || VIRTUAL_OS_TUNNEL;
	if (
		tunnelName !== VIRTUAL_OS_TUNNEL ||
		device.ownedByCurrentUser === false
	) {
		return null;
	}
	const allowWrite = device.allowWrite === true;
	const allowCommands = device.allowCommands === true;
	return Object.freeze({
		connected: device.isAlive !== false,
		isAlive: device.isAlive !== false,
		routeReference: text(device.routeReference) || VIRTUAL_OS_TUNNEL,
		tunnelId: "",
		tunnelName: VIRTUAL_OS_TUNNEL,
		deviceId: "",
		deviceName: text(device.deviceName) || "Awtsmoos Virtual OS",
		capabilities: sanitizeCapabilities({
			fsRead: true,
			fsWrite: allowWrite,
			commandRun: allowCommands
		}),
		permissions: [
			"tunnel.read",
			...(allowWrite ? ["tunnel.write"] : []),
			...(allowCommands ? ["tunnel.command"] : [])
		],
		access: "owned",
		shared: false,
		role: "virtual",
		ownershipVerified: true,
		kind: "virtual-os",
		vesselType: "virtual-os",
		canUseWithoutAgent: device.canUseWithoutAgent === true
	});
}

export function sanitizeIdentity(identity = {}) {
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

export function warningsFor(raw, removed) {
	const warnings = array(raw.warnings).map(value => {
		return typeof value === "string"
			? text(value)
			: text(value?.code || value?.guidance);
	}).filter(Boolean);
	if (removed) {
		warnings.push("unverified_device_records_removed");
	}
	if (raw.ok === false && raw.error) {
		warnings.push(`source_${text(raw.error)}`);
	}
	return [...new Set(warnings)];
}

export function array(value) {
	return Array.isArray(value) ? value : [];
}
