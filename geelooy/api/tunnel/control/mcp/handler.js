// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Stateless OAuth-protected Streamable HTTP JSON-RPC gateway.
 * @description
 * The Awtsmoos creates the gate and every messenger anew.
 * Before Awtsmoos.com explains which methods may cross this boundary,
 * it must first reveal the protected resource to an unauthenticated caller.
 * Muse and every lawful client must receive the Bearer challenge on GET
 * as well as POST, yet an authenticated GET still has no JSON-RPC license.
 */

const Auth = require("./auth.js");
const Protocol = require("./protocol.js");
const Request = require("../core/request.js");
const Respond = require("../core/respond.js");
const Transport = require("./transportResponse.js");

function rpcError(id, code, message, data) {
	return {
		jsonrpc: "2.0",
		id: id ?? null,
		error: {
			code,
			message,
			...(data === undefined ? {} : { data })
		}
	};
}

function rpcResult(id, result) {
	return { jsonrpc: "2.0", id, result };
}

function requestMethod($i) {
	return String($i.request?.method || $i.method || "POST").toUpperCase();
}

/**
 * Challenges callers before method or body validation and then dispatches
 * only authorized POST messages to the stateless JSON-RPC protocol.
 */
async function handleMcp($i) {
	const authorization = Auth.authorize($i);
	if (!authorization.ok) {
		return Transport.json(
			$i,
			rpcError(null, -32000, "OAuth bearer authorization required."),
			authorization.status,
			authorization.headers
		);
	}
	if (requestMethod($i) !== "POST") {
		Respond.setHeader($i, "Allow", "POST");
		return Transport.json($i, rpcError(null, -32600, "MCP requires POST."), 405, { Allow: "POST" });
	}
	let message;
	try {
		message = await Request.body($i);
	} catch (error) {
		return Transport.json($i, rpcError(null, -32700, "Invalid JSON."), 400);
	}
	if (!message || message.jsonrpc !== "2.0" || !message.method) {
		return Transport.json($i, rpcError(message?.id, -32600, "Invalid JSON-RPC request."), 400);
	}
	if (message.id === undefined && message.method === "notifications/initialized") {
		return Transport.empty(202);
	}
	try {
		const result = await Protocol.dispatch($i, authorization.identity, message);
		return Transport.json($i, rpcResult(message.id, result), 200);
	} catch (error) {
		const code = Number.isInteger(error.code) ? error.code : -32001;
		return Transport.json(
			$i,
			rpcError(message.id, code, error.message || "MCP request failed.", error.data),
			code === -32601 ? 404 : 200
		);
	}
}

module.exports = { handleMcp };
