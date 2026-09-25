//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosts the stateless Streamable HTTP JSON-RPC edge for Awtsmoos MCP.
 * @description
 * The Awtsmoos sends each request complete, with no hidden session chain;
 * Awtsmoos.com authenticates the audience first, then lets JSON-RPC explain.
 * One POST may discover, list, or call, while every bearer stays resource-bound.
 */

const Auth = require("./auth.js");
const Protocol = require("./protocol.js");
const Request = require("../core/request.js");
const Respond = require("../core/respond.js");

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

/** Handles one authenticated MCP request without allocating server-side session state. */
async function handleMcp($i) {
	if (requestMethod($i) !== "POST") {
		Respond.setHeader($i, "Allow", "POST");
		return Respond.json($i, rpcError(null, -32600, "MCP requires POST."), 405);
	}
	let message;
	try {
		message = await Request.body($i);
	} catch (error) {
		return Respond.json($i, rpcError(null, -32700, "Invalid JSON."), 400);
	}
	if (!message || message.jsonrpc !== "2.0" || !message.method) {
		return Respond.json($i, rpcError(message?.id, -32600, "Invalid JSON-RPC request."), 400);
	}
	const authorization = Auth.authorize($i);
	if (!authorization.ok) {
		return Respond.json(
			$i,
			rpcError(message.id, -32000, "OAuth bearer authorization required."),
			authorization.status
		);
	}
	if (message.id === undefined && message.method === "notifications/initialized") {
		Respond.setStatus($i, 202);
		return "";
	}
	try {
		const result = await Protocol.dispatch($i, authorization.identity, message);
		return Respond.json($i, rpcResult(message.id, result), 200);
	} catch (error) {
		const code = Number.isInteger(error.code) ? error.code : -32001;
		return Respond.json(
			$i,
			rpcError(message.id, code, error.message || "MCP request failed.", error.data),
			code === -32601 ? 404 : 200
		);
	}
}

module.exports = { handleMcp };
