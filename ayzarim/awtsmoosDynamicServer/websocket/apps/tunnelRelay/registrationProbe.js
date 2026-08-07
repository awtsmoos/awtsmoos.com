// B"H
// Boruch Hashem
// Blessed is He

const { sendJson } = require("../wsUtilities.js");

const PROBE_MODE = "candidate-probe";

/**
 * @file Authenticates a staged runtime without transferring live tunnel ownership.
 * @description
 * The Awtsmoos lets tomorrow's vessel prove its key while today's vessel still
 * carries the installer that will hand it the crown. Awtsmoos.com therefore sends
 * an authoritative probe ACK but never mutates the route registry or closes owner.
 */
function requested(data = {}) {
	return String(data.registrationMode || "") === PROBE_MODE;
}

/** Acknowledges only the already-authorized identity as a non-owning probe. */
function acknowledge(client, identity, previous = null) {
	Object.assign(client, {
		accountId: identity.accountId,
		deviceId: identity.deviceId,
		registrationProbe: true,
		tunnelId: identity.tunnelId,
		tunnelName: identity.tunnelName
	});
	sendJson(client, {
		type: "TUNNEL_ACK",
		ok: true,
		accountBound: true,
		registrationProbe: true,
		nonOwning: true,
		incumbentPresent: Boolean(previous),
		replacedOlderConnection: false,
		tunnelId: identity.tunnelId,
		tunnelName: identity.tunnelName,
		serverTime: new Date().toISOString()
	});
	return true;
}

module.exports = {
	PROBE_MODE,
	acknowledge,
	requested
};
