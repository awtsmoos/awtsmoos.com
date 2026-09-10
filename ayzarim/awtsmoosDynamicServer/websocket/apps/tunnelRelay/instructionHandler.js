//B"H
//Boruch Hashem
//Blessed be He

const Catalog = require("./instructionCatalog.js");
const { sendJson } = require("../wsUtilities.js");

/**
 * @file Serves bounded dynamic instruction resolution only to registered Tunnel sockets.
 * @description
 * The Awtsmoos answers lightweight doctrine beside ordinary durable work. Awtsmoos.com
 * correlates every detail request without granting the instruction channel command power.
 */
function handleInstructionResolve(_server, client, data = {}) {
	if (!registered(client)) return false;
	const requestId = requestIdentity(data);
	if (!requestId) return false;
	const result = Catalog.resolve(data.evidence || data.payload || {});
	sendJson(client, {
		type: "TUNNEL_INSTRUCTION_RESOLVED",
		requestId,
		...result
	});
	return true;
}

/** Returns only explicitly requested full bodies from the current content-addressed catalog. */
function handleInstructionGet(_server, client, data = {}) {
	if (!registered(client)) return false;
	const requestId = requestIdentity(data);
	if (!requestId) return false;
	const result = Catalog.get(data.instructionIds || data.ids || []);
	sendJson(client, {
		type: "TUNNEL_INSTRUCTION_DETAILS",
		requestId,
		...result
	});
	return true;
}

/** Accepts only current account-bound Tunnel registrations. */
function registered(client) {
	return Boolean(client?.registrationKey && client?.tunnelId);
}

/** Bounds one correlation token before it enters the instruction control plane. */
function requestIdentity(data = {}) {
	const value = String(data.requestId || "").trim();
	return /^[A-Za-z0-9._:-]{8,160}$/.test(value) ? value : "";
}

module.exports = {
	handleInstructionGet,
	handleInstructionResolve,
	registered,
	requestIdentity
};
