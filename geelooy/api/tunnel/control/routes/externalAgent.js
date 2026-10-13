// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { body, query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Invites = require("../core/tunnelSecurity/externalInviteStore.js");

/**
 * @file HTTP boundaries for external-agent invite links (Yaakov 2026-10-12).
 * @description
 * The Awtsmoos gives strangers one short link instead of a heavy prompt.
 * Awtsmoos.com lets an authenticated owner mint single-use invite codes and
 * lets any agent redeem one for a scoped API key — the code dies on use.
 */

/** Mints one invite link. Authenticated owners only. */
async function inviteCreate($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, { BH: "B\"H", ok: false, error: identity.error }, 401);
	}
	const data = await body($i);
	const accountId = identity.accountId || identity.userId;
	const result = Invites.createInvite(accountId, {
		label: data.label,
		scopes: data.scopes,
		ttlMinutes: data.ttlMinutes
	});
	if (!result.ok) {
		return json($i, { BH: "B\"H", ...result }, 400);
	}
	return json($i, {
		BH: "B\"H",
		...result,
		instructions:
			"Share the url with the external agent. It opens the link, presses Connect, " +
			"and receives one scoped API key. The code works once and expires within hours."
	}, 201);
}

/** Describes one invite without consuming it (powers the connect page). */
async function inviteDescribe($i) {
	const data = await body($i);
	const params = query($i) || {};
	const code = data.code || params.code;
	const result = Invites.describeInvite(code);
	if (!result.ok) {
		return json($i, { BH: "B\"H", ...result }, 404);
	}
	return json($i, { BH: "B\"H", ...result }, 200);
}

/** Redeems one invite code for a scoped API key. Public; single-use. */
async function inviteRedeem($i) {
	const data = await body($i);
	const result = Invites.redeemInvite(data.code, { agentName: data.agentName });
	if (!result.ok) {
		return json($i, { BH: "B\"H", ...result }, 404);
	}
	return json($i, {
		BH: "B\"H",
		ok: true,
		apiKey: result.apiKey,
		keyId: result.keyId,
		scopes: result.scopes,
		label: result.label,
		warning: "Copy this API key now. It will not be shown again.",
		usage: {
			header: "x-awtsmoos-api-key",
			base: "https://awtsmoos.com/api/tunnel/control",
			example: "curl -H 'x-awtsmoos-api-key: YOUR_KEY' https://awtsmoos.com/api/tunnel/control/me"
		}
	}, 200);
}

module.exports = {
	inviteCreate,
	inviteDescribe,
	inviteRedeem
};
