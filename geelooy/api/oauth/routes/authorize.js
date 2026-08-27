// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth authorization-code gate for Awtsmoos.com clients.
 * @description
 * The Awtsmoos grants no authority by a guessed name alone; redirect, scope,
 * consent, state, and Grok's PKCE challenge must all arrive in their appointed
 * vessels before a five-minute one-time code may descend.
 */

const { getClient } = require("../core/clients.js");
const { saveCode } = require("../core/codeStore.js");
const { getUserId } = require("../core/currentUser.js");
const Pkce = require("../core/pkce.js");
const ScopeEvolution = require("../core/scopeEvolution.js");
const { validateScope } = require("../core/scopes.js");
const { getBody, getQuery } = require("../tools/requestData.js");
const { browserRedirect, html, json, redirect } = require("../tools/respond.js");
const { fullUrlFor, urlWithParams } = require("../tools/urls.js");
const View = require("./authorizeView.js");

function requestValues(query, body) {
	return {
		clientId: query.client_id || body.client_id || "chatgpt",
		responseType: query.response_type || body.response_type || "code",
		redirectUri: query.redirect_uri || body.redirect_uri || "",
		requestedScope: query.scope || body.scope || "",
		state: query.state || body.state || "",
		approve: query.approve || body.approve || "",
		codeChallenge: query.code_challenge || body.code_challenge || "",
		codeChallengeMethod: query.code_challenge_method || body.code_challenge_method || ""
	};
}

function authorizationPath(client, values, scope, approve = "") {
	return View.buildAuthorizeUrl({
		clientId: client.id,
		redirectUri: values.redirectUri,
		scope,
		state: values.state,
		codeChallenge: values.codeChallenge,
		codeChallengeMethod: values.codeChallengeMethod,
		approve
	});
}

async function authorize($i) {
	const values = requestValues(getQuery($i), await getBody($i));
	if (values.responseType !== "code") {
		return json($i, { BH: "B\"H", ok: false, error: "unsupported_response_type" }, 400);
	}
	const client = getClient(values.clientId);
	if (!client) {
		return json($i, { BH: "B\"H", ok: false, error: "invalid_client" }, 400);
	}
	if (!client.redirectAllowed(values.redirectUri)) {
		return json($i, {
			BH: "B\"H",
			ok: false,
			error: "redirect_uri_not_allowed",
			redirect_uri: values.redirectUri,
			allowed: client.redirectUris
		}, 400);
	}
	const pkce = Pkce.validateAuthorization(
		client,
		values.codeChallenge,
		values.codeChallengeMethod
	);
	if (!pkce.ok) {
		return json($i, { BH: "B\"H", ok: false, error: pkce.error }, 400);
	}
	const evolvedScope = ScopeEvolution.effectiveScope(
		client,
		values.requestedScope || client.defaultScope
	);
	const scopeCheck = validateScope(evolvedScope, client.scopes);
	if (!scopeCheck.ok) {
		return json($i, {
			BH: "B\"H",
			ok: false,
			error: "invalid_scope",
			invalid: scopeCheck.invalid,
			allowed: client.scopes
		}, 400);
	}
	const userId = getUserId($i);
	if (!userId) {
		return redirect($i, View.loginUrl($i, authorizationPath(client, values, scopeCheck.scope)));
	}
	if (!client.autoApprove && !View.isApproved(values.approve)) {
		const approvePath = authorizationPath(client, values, scopeCheck.scope, "1");
		return html($i, View.approvalHtml({
			client,
			userId,
			scope: scopeCheck.scope,
			approveUrl: fullUrlFor($i, approvePath)
		}));
	}
	const code = await saveCode({
		userId,
		clientId: client.id,
		redirectUri: values.redirectUri,
		scope: scopeCheck.scope,
		state: values.state,
		codeChallenge: pkce.challenge,
		codeChallengeMethod: pkce.method
	});
	return browserRedirect($i, urlWithParams(values.redirectUri, {
		code,
		state: values.state
	}));
}

module.exports = {
	authorize,
	requestValues
};
