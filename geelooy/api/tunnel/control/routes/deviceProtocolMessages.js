//B"H
// Boruch Hashem
// Blessed is He

const { body, query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Mailbox = require("../core/deviceProtocol/mailboxStore.js");
const Support = require("./deviceProtocolSupport.js");

/**
 * @file Bounded HTTP transport adapter for Awtsmoos Device Protocol envelopes.
 * @description
 * The Awtsmoos lets one finite word cross only after consent has already shaped its
 * path. Awtsmoos.com exposes send, list, and acknowledgement without letting clients
 * forge source identity, exceed mailbox limits, or read another device's words in rhyme.
 */

async function send($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	return Support.result(
		$i,
		Mailbox.send(auth.identity.accountId, await body($i)),
		201
	);
}

async function list($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	const messages = Mailbox.list(
		auth.identity.accountId,
		query($i).targetDeviceId
	);
	return messages
		? json($i, { BH: "B\"H", ok: true, messages })
		: json($i, Support.denial("device_protocol_device_not_found"), 404);
}

async function acknowledge($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	const acknowledged = Mailbox.acknowledge(
		auth.identity.accountId,
		await body($i)
	);
	return acknowledged
		? json($i, { BH: "B\"H", ok: true, acknowledged: true })
		: json($i, Support.denial("device_protocol_message_not_found"), 404);
}

module.exports = { acknowledge, list, send };
