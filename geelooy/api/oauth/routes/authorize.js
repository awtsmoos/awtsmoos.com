// B"H
// Boruch Hashem
// Blessed is He

const { getClient } = require("../core/clients.js");
const { saveCode } = require("../core/codeStore.js");
const { getUserId } = require("../core/currentUser.js");
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
		approve: query.approve || body.approve || ""
	};
}

async function authorize($i) {
	const values = requestValues(getQuery($i), await getBody($i));
	if (values.responseType !== "code") {
		return json($i, {
			BH: "B\"H",
			ok: false,
			error: "unsupported_response_type"
		}, 400);
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
		const nextPath = View.buildAuthorizeUrl({
			clientId: client.id,
			redirectUri: values.redirectUri,
			scope: scopeCheck.scope,
			state: values.state
		});
		return redirect($i, View.loginUrl($i, nextPath));
	}
	if (!client.autoApprove && !View.isApproved(values.approve)) {
		const approvePath = View.buildAuthorizeUrl({
			clientId: client.id,
			redirectUri: values.redirectUri,
			scope: scopeCheck.scope,
			state: values.state,
			approve: "1"
		});
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
		state: values.state
	});
	return browserRedirect($i, urlWithParams(values.redirectUri, {
		code,
		state: values.state
	}));
}

module.exports = { authorize };
