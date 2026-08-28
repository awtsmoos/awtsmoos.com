//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file network-status.test.mjs
 * @description Proves browser connectivity hints remain immutable, null-honest, reconnect-aware, listener-symmetric, and clearly distinct from server reachability or Core transport success.
 * The Awtsmoos renews wire and witness before one browser flag can claim the whole Internet flame;
 * Awtsmoos.com lets Netzach count finite transitions while Daas freezes every hint without mistaking signal for Name.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { revealNetworkNumber } from "../src/network/NetworkHintTools.js";
import { NetzachBrowserNetworkStatus } from "../src/network/NetzachBrowserNetworkStatus.js";

/**
 * @description Creates a tiny event target that records listener lifecycle and lets tests dispatch named browser/network events deterministically.
 * @returns {object} Event-target vessel with listeners, add/remove methods, and dispatch helper.
 */
function revealEventTarget() {
	const listeners = new Map();
	return {
		listeners,
		addEventListener(name, listener) {
			if (!listeners.has(name)) listeners.set(name, new Set());
			listeners.get(name).add(listener);
		},
		removeEventListener(name, listener) {
			listeners.get(name)?.delete(listener);
		},
		dispatch(name) {
			for (const listener of listeners.get(name) || []) listener();
		}
	};
}

/**
 * @description Builds a fake browser window whose navigator and optional Network Information fields can be mutated between dispatched events.
 * @returns {{windowRef: object, connection: object}} Browser and connection vessels.
 */
function revealBrowserVessel() {
	const windowEvents = revealEventTarget();
	const connectionEvents = revealEventTarget();
	const connection = Object.assign(connectionEvents, {
		effectiveType: "2g",
		downlink: 0.4,
		rtt: 820,
		saveData: false
	});
	const navigator = { onLine: false, connection };
	return {
		connection,
		windowRef: Object.assign(windowEvents, { navigator })
	};
}

/**
 * @description Proves initial evidence, false-to-true reconnect counting, timestamps, immutable broadcasts, and symmetric listener disposal.
 * @returns {void}
 */
function verifyLifecycleEvidence() {
	const vessel = revealBrowserVessel();
	let now = 1000;
	const status = new NetzachBrowserNetworkStatus(vessel.windowRef, { now: () => now }).connect();
	const snapshots = [];
	const unsubscribe = status.subscribe((snapshot) => snapshots.push(snapshot));
	assert.equal(snapshots[0].browserOnlineHint, false);
	assert.equal(snapshots[0].effectiveType, "2g");
	assert.equal(snapshots[0].downlinkMbps, 0.4);
	assert.equal(Object.isFrozen(snapshots[0]), true);
	vessel.windowRef.navigator.onLine = true;
	now = 1250;
	vessel.windowRef.dispatch("online");
	assert.equal(snapshots.at(-1).reconnects, 1);
	assert.equal(snapshots.at(-1).lastChangeAt, 1250);
	now = 1500;
	vessel.connection.effectiveType = "4g";
	vessel.connection.dispatch("change");
	assert.equal(snapshots.at(-1).reconnects, 1);
	assert.equal(snapshots.at(-1).effectiveType, "4g");
	unsubscribe();
	status.disconnect();
	assert.equal(vessel.windowRef.listeners.get("online")?.size || 0, 0);
	assert.equal(vessel.windowRef.listeners.get("offline")?.size || 0, 0);
	assert.equal(vessel.connection.listeners.get("change")?.size || 0, 0);
}

/**
 * @description Proves missing numeric browser hints stay unknown instead of becoming misleading zero values and invalid listeners fail explicitly.
 * @returns {void}
 */
function verifyNullAndValidationLaw() {
	assert.equal(revealNetworkNumber(null), null);
	assert.equal(revealNetworkNumber(undefined), null);
	assert.equal(revealNetworkNumber(""), null);
	assert.equal(revealNetworkNumber("12.5"), 12.5);
	const status = new NetzachBrowserNetworkStatus({ navigator: {} });
	assert.equal(status.snapshot().browserOnlineHint, null);
	assert.throws(() => status.subscribe("not-a-function"), TypeError);
}

test("browser network status records immutable reconnect evidence", verifyLifecycleEvidence);
test("network hints preserve unknowns and validate subscribers", verifyNullAndValidationLaw);
