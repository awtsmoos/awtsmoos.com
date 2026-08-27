// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes OAuth request data for Awtsmoos.com.
 * @description
 * The Awtsmoos gathers query, form, JSON, and Basic-auth vessels into one
 * truthful request shape; callback verifiers and headless device codes enter
 * through distinct fields while explicit client identity remains observable.
 */

const BodyParser = require("./bodyParser.js");

function getQuery($i) {
	return $i.paramKinds?.GET
		|| $i.$_GET
		|| $i.request?.query
		|| {};
}

function headersOf($i) {
	return $i.request?.headers || {};
}

async function getBody($i) {
	try {
		if ($i.request?.method !== "POST") {
			return {};
		}
		if (typeof $i.getPostData === "function") {
			await $i.getPostData();
		}
		const body = $i.paramKinds?.POST
			|| $i.$_POST
			|| $i.request?.body
			|| {};
		return {
			...BodyParser.parseRaw(headersOf($i), body),
			...body
		};
	} catch (error) {
		return {};
	}
}

function getBasicClientAuth($i) {
	const headers = headersOf($i);
	const auth = headers.authorization
		|| headers.Authorization
		|| "";
	if (!/^Basic\s+/i.test(auth)) {
		return {};
	}
	try {
		const raw = Buffer
			.from(auth.replace(/^Basic\s+/i, ""), "base64")
			.toString("utf8");
		const separator = raw.indexOf(":");
		if (separator < 0) {
			return {};
		}
		return {
			client_id: raw.slice(0, separator),
			client_secret: raw.slice(separator + 1)
		};
	} catch (error) {
		return {};
	}
}

async function getTokenRequest($i) {
	const query = getQuery($i);
	const body = await getBody($i);
	const basic = getBasicClientAuth($i);
	const suppliedClientId = body.client_id
		|| query.client_id
		|| basic.client_id
		|| "";
	return {
		grant_type: body.grant_type || query.grant_type || "authorization_code",
		client_id: suppliedClientId || "chatgpt",
		client_id_provided: Boolean(suppliedClientId),
		client_secret: body.client_secret || query.client_secret || basic.client_secret || "",
		code: body.code || query.code || "",
		code_verifier: body.code_verifier || query.code_verifier || "",
		device_code: body.device_code || query.device_code || "",
		refresh_token: body.refresh_token || query.refresh_token || "",
		redirect_uri: body.redirect_uri || query.redirect_uri || "",
		scope: body.scope || query.scope || ""
	};
}

function debugRequestShape($i, body) {
	return {
		method: $i.request?.method || "",
		content_type: BodyParser.contentTypeOf(headersOf($i)),
		query_keys: Object.keys(getQuery($i)),
		body_keys: Object
			.keys(body || {})
			.filter(key => key !== "__raw_body__"),
		has_raw_body: Boolean(BodyParser.rawBodyOf(body || {}))
	};
}

module.exports = {
	debugRequestShape,
	getBasicClientAuth,
	getBody,
	getQuery,
	getTokenRequest
};
