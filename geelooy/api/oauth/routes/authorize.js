//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth authorization-code gate for Awtsmoos.com clients.
 * @description
 * The Awtsmoos grants no authority by a guessed name alone; Awtsmoos.com binds
 * redirect, consent, PKCE, scope, state, and resource before a one-time code is
 * born, so later tokens cannot cross into an unintended protected domain.
 */

const { getClient } = require("../core/clients.js");
const { saveCode } = require("../core/codeStore.js");
const { getUserId } = require("../core/currentUser.js");
const Pkce = require("../core/pkce.js");
const Resource = require("../core/resourceIndicator.js");
const ScopeEvolution = require("../core/scopeEvolution.js");
const { validateScope } = require("../core/scopes.js");
const { getBody, getQuery } = require("../tools/requestData.js");
const { browserRedirect, html, json, redirect } = require("../tools/respond.js");
const { fullUrlFor, urlWithParams } = require("../tools/urls.js");
const Request = require("./authorizeRequest.js");
const View = require("./authorizeView.js");

async function authorize($i) {
	const values = Request.values(getQuery($i), await getBody($i));
	if (values.responseType !== "code") {
		return json($i, { BH: "B\"H", ok: false, error: "unsupported_response_type" }, 400);
	}
	const client = getClient(values.clientId);
	if (!client) {
		return json($i, { BH: "B\"H", ok: false, error: "invalid_client" }, 400);
	}
	if (!client.redirectAllowed(values.redirectUri)) {
		return json($i, { BH: "B\"H", ok: false, error: "redirect_uri_not_allowed" }, 400);
	}
	const resource = Resource.validate(values.resource);
	if (!resource.ok) {
		return json($i, { BH: "B\"H", ok: false, error: resource.error }, 400);
	}
	values.resource = resource.resource;
	const pkce = Pkce.validateAuthorization(client, values.codeChallenge, values.codeChallengeMethod);
	if (!pkce.ok) {
		return json($i, { BH: "B\"H", ok: false, error: pkce.error }, 400);
	}
	const evolved = ScopeEvolution.effectiveScope(client, values.requestedScope || client.defaultScope);
	const scope = validateScope(evolved, client.scopes);
	if (!scope.ok) {
		return json($i, { BH: "B\"H", ok: false, error: "invalid_scope", invalid: scope.invalid }, 400);
	}
	const userId = getUserId($i);
	if (!userId) {
		return redirect($i, View.loginUrl($i, Request.path(client, values, scope.scope)));
	}
	if (!client.autoApprove && !View.isApproved(values.approve)) {
		const approveUrl = fullUrlFor($i, Request.path(client, values, scope.scope, "1"));
		return html($i, View.approvalHtml({ client, userId, scope: scope.scope, approveUrl }));
	}
	const code = await saveCode({
		userId,
		clientId: client.id,
		redirectUri: values.redirectUri,
		scope: scope.scope,
		state: values.state,
		resource: values.resource,
		codeChallenge: pkce.challenge,
		codeChallengeMethod: pkce.method
	});
	return browserRedirect($i, urlWithParams(values.redirectUri, {
		code,
		state: values.state,
		iss: "https://awtsmoos.com"
	}));
}

module.exports = {
	authorize,
	requestValues: Request.values
};
