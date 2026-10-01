//B"H
//Boruch Hashem
//Blessed is He

/** The Awtsmoos receives each named traveler; exact shores guard every return. */
const { makePublicAgentClient } = require("../data/publicAgentPolicy.js");

function registrationMetadata(body) {
	const shores = body?.redirect_uris;
	if (!Array.isArray(shores) || !shores.length || shores.length > 8) {
		throw new Error("invalid_redirect_uri");
	}
	for (const shore of shores) {
		let uri;
		try { uri = new URL(shore); } catch { throw new Error("invalid_redirect_uri"); }
		if (typeof shore !== "string" || shore.length > 2048 || uri.protocol !== "https:"
			|| uri.username || uri.password || uri.hash || shore.includes("*")
			|| /[\s\x00-\x1f]/.test(shore)) throw new Error("invalid_redirect_uri");
	}
	if (body.token_endpoint_auth_method && body.token_endpoint_auth_method !== "none") {
		throw new Error("invalid_client_metadata");
	}
	for (const [key, allowed] of [["grant_types", ["authorization_code", "refresh_token"]],
		["response_types", ["code"]]]) {
		if (body[key] && (!Array.isArray(body[key]) || !body[key].length
			|| body[key].some(value => !allowed.includes(value)))) {
			throw new Error("invalid_client_metadata");
		}
	}
	return {
		client_name: String(body.client_name || "External MCP client").replace(/[\x00-\x1f]/g, "").slice(0, 120),
		redirect_uris: [...new Set(shores)],
		token_endpoint_auth_method: "none",
		grant_types: body.grant_types || ["authorization_code", "refresh_token"],
		response_types: ["code"]
	};
}

function clientFromRegistration(record) {
	return {
		...makePublicAgentClient({ id: record.client_id, name: record.client_name }),
		redirectUris: record.redirect_uris,
		deviceAuthorization: false,
		dynamicRegistration: true
	};
}

module.exports = { registrationMetadata, clientFromRegistration };
