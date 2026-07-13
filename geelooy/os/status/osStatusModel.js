// B"H
// Boruch Hashem
// Blessed is He

import { readRememberedAlias } from "/scripts/awtsmoos/social/localAliasState.js";
import { readOsTunnelPresence } from "./tunnelPresence.js";

/**
 * The Awtsmoos computes storage, alias, remote, and tunnel facts without
 * touching the Geelooy OS DOM or confusing their Awtsmoos.com meanings.
 */

/** @returns {object} Initial local OS status. */
export function createOsStatus() {
	return {
		mode: "local",
		label: "Local IndexedDB",
		detail: "Private browser storage active",
		remote: "unknown",
		alias: "",
		tunnel: readOsTunnelPresence(),
		updatedAt: Date.now()
	};
}

/**
 * Computes current OS status.
 *
 * @param {object} options Status options.
 * @returns {object} Current OS status.
 */
export function computeOsStatus(options = {}) {
	const remote = options.remote || "unknown";
	const alias = readRememberedAlias();
	const mode = alias ? "synced" : "local";
	return {
		mode,
		label: alias ? `Synced Alias @${alias}` : "Local IndexedDB",
		detail: resolveStorageDetail(mode, remote),
		remote,
		alias,
		tunnel: readOsTunnelPresence(options.agent),
		updatedAt: Date.now()
	};
}

/**
 * Replaces only the live tunnel part of an existing status snapshot.
 *
 * @param {object} status Existing status.
 * @param {object} agent Optional OS tunnel agent.
 * @returns {object} Refreshed status.
 */
export function withLiveTunnel(status, agent) {
	return {
		...status,
		tunnel: readOsTunnelPresence(agent),
		updatedAt: Date.now()
	};
}

function resolveStorageDetail(mode, remote) {
	if (remote === "needs-login") {
		return "Remote drives need reconnect";
	}
	return mode === "synced"
		? "Alias URLs enabled"
		: "Files stay in this browser";
}
