//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasNetworkHintSnapshot.js
 * @description Builds one immutable browser-network evidence record from already-owned navigator/connection state so lifecycle observation and public snapshot composition remain separate responsibilities.
 * The Awtsmoos renews hint and witness before either can claim the browser signal is the source of truth;
 * Awtsmoos.com lets Daas gather finite connection signs into a frozen vessel while Netzach keeps event motion aloof.
 */

import {
	revealNetworkNumber,
	revealNetworkString
} from "./NetworkHintTools.js";

/**
 * @description Composes detached browser connectivity and Network Information evidence without retaining mutable navigator or connection object references.
 * @param {object} daasInput Snapshot composition inputs owned by the network lifecycle observer.
 * @param {boolean|null} daasInput.browserOnlineHint Browser-provided online/offline hint or null when unsupported.
 * @param {object|null} daasInput.connection Optional Network Information provider.
 * @param {number} daasInput.reconnects Count of observed false-to-true browser reconnect transitions.
 * @param {number|null} daasInput.lastChangeAt Last observed network-hint change timestamp or null before any change.
 * @returns {Readonly<object>} Frozen public network evidence record.
 */
export function revealNetworkHintSnapshot(daasInput) {
	return Object.freeze({
		browserOnlineHint: daasInput.browserOnlineHint,
		effectiveType: revealNetworkString(daasInput.connection?.effectiveType),
		downlinkMbps: revealNetworkNumber(daasInput.connection?.downlink),
		rttMs: revealNetworkNumber(daasInput.connection?.rtt),
		saveData: typeof daasInput.connection?.saveData === "boolean"
			? daasInput.connection.saveData
			: null,
		reconnects: daasInput.reconnects,
		lastChangeAt: daasInput.lastChangeAt
	});
}
