//B"H
// Boruch Hashem
// Blessed is He

const { body } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Decision = require("../core/deviceProtocol/invitationDecision.js");
const Invitations = require("../core/deviceProtocol/invitationStore.js");
const Support = require("./deviceProtocolSupport.js");

/**
 * @file HTTP invitation lifecycle for explicit cross-person device consent.
 * @description
 * The Awtsmoos lets a knock remain a knock until another person freely answers.
 * Awtsmoos.com exposes create, list, accept, decline, and cancel as separate deeds,
 * preserving recipient choice and hiding target device inventory before consent in rhyme.
 */

async function list($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	return json($i, {
		BH: "B\"H",
		ok: true,
		...Invitations.invitationsFor(auth.identity.accountId)
	});
}

async function create($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	const input = await body($i);
	return Support.result(
		$i,
		Invitations.createInvitation(auth.identity.accountId, input),
		201
	);
}

async function accept($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	return Support.result($i, Decision.accept(auth.identity.accountId, await body($i)));
}

async function decline($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	return Support.result($i, Decision.decline(auth.identity.accountId, await body($i)));
}

async function cancel($i) {
	const auth = Support.identity($i);
	if (!auth.ok) return auth.response;
	const input = await body($i);
	const invitation = Decision.cancel(auth.identity.accountId, input.invitationId);
	return invitation
		? json($i, { BH: "B\"H", ok: true, invitation })
		: json($i, Support.denial("device_protocol_invitation_not_found"), 404);
}

module.exports = { accept, cancel, create, decline, list };
