// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves OAuth client vessels and their public capabilities.
 * @description
 * The Awtsmoos is beyond every client name, yet Awtsmoos.com reveals each
 * redirect, scope, PKCE, and headless-device boundary truthfully so an agent
 * can discover what is allowed without guessing at hidden provider policy.
 */

const { oauthClients } = require("../data/clients.js");

function escapeRegex(text) {
	return String(text).replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

function wildcardToRegex(rule) {
	const escaped = escapeRegex(rule)
		.replace(/\\\*/g, ".*")
		.replace(/\*/g, ".*");
	return new RegExp(`^${escaped}$`);
}

function uriForms(uri) {
	const forms = new Set();
	if (uri) {
		forms.add(String(uri));
	}
	try {
		const parsed = new URL(uri);
		forms.add(parsed.toString());
		if (parsed.pathname === "/" && !parsed.search && !parsed.hash) {
			forms.add(parsed.origin);
			forms.add(`${parsed.origin}/`);
		}
	} catch (error) {}
	return [...forms];
}

function ruleAllows(uri, rule) {
	if (!uri || !rule) {
		return false;
	}
	return uriForms(uri).some(form => {
		if (form === rule) {
			return true;
		}
		return String(rule).includes("*") && wildcardToRegex(rule).test(form);
	});
}

function getClient(id) {
	const client = oauthClients[id || "chatgpt"] || null;
	if (!client) {
		return null;
	}
	return {
		...client,
		clientSecret: client.clientSecret || client.secret || "",
		secret: client.secret || client.clientSecret || "",
		redirectAllowed(uri) {
			const rules = client.redirectUris
				|| client.redirectURIs
				|| client.allowedRedirectUris
				|| [];
			return rules.some(rule => ruleAllows(uri, rule));
		},
		secretAllowed(secret) {
			const expected = client.clientSecret || client.secret || "";
			return !expected || String(secret || "") === expected;
		}
	};
}

function publicClient(client) {
	return {
		id: client.id,
		name: client.name,
		scopes: client.scopes,
		defaultScope: client.defaultScope,
		autoApprove: client.autoApprove,
		requiresPkce: Boolean(client.requirePkce),
		pkceMethod: client.pkceMethod || "",
		deviceAuthorization: Boolean(client.deviceAuthorization),
		exampleRedirectUri: client.exampleRedirectUri || ""
	};
}

function listClients() {
	return Object.values(oauthClients).map(publicClient);
}

module.exports = {
	getClient,
	listClients,
	publicClient,
	ruleAllows,
	uriForms,
	wildcardToRegex
};
