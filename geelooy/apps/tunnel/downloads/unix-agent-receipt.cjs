#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He
const fs = require("node:fs");
const path = require("node:path");

/** Adds schema-4 health receipts only to agents lacking native support. */
function attach(root) {
	if (nativeReceiptSupported(root)) return { native: true, write() {} };
	const state = createState(root);
	patchSocket(root, state);
	return { native: false, write: (name, details) => writeReceipt(state, name, details) };
}

function nativeReceiptSupported(root) {
	try {
		const receipt = require(path.join(root, "lib/runtime/connection-receipt.js"));
		return Number(receipt.SCHEMA_VERSION || 0) >= 4;
	} catch { return false; }
}

function createState(root) {
	return {
		root, file: path.join(root, "connection-state.json"),
		config: readJson(path.join(root, "config.json"), {}),
		identity: readJson(path.join(root, "device-binding.json"), {}), generation: 0
	};
}

function patchSocket(root, state) {
	const WebSocket = require(path.join(root, "lib/ws.js")).TinyWebSocket;
	const marker = Symbol.for("awtsmoos.compatibility.receipt.patch");
	if (WebSocket.prototype[marker]) return;
	WebSocket.prototype[marker] = true;
	const originalEmit = WebSocket.prototype.emit;
	WebSocket.prototype.emit = function patchedEmit(eventName, ...argumentsList) {
		const result = originalEmit.call(this, eventName, ...argumentsList);
		if (eventName === "open") {
			state.generation += 1;
			writeReceipt(state, "socket_open");
		}
		if (eventName === "message") observeMessage(state, argumentsList[0]);
		if (eventName === "close") writeReceipt(state, "closed", { reason: "socket_closed" });
		return result;
	};
}

function observeMessage(state, raw) {
	const now = new Date().toISOString();
	const message = parseMessage(raw);
	if (message?.type === "TUNNEL_ACK") {
		writeReceipt(state, message.ok === true ? "registered" : "registration_rejected", {
			tunnelId: message.tunnelId || state.identity.tunnelId || "",
			tunnelName: message.tunnelName || message.name || "",
			serverTime: message.serverTime || null, lastServerMessageAt: now,
			reason: message.ok === true ? "" : String(message.error || "registration_rejected")
		});
		return;
	}
	const existing = readJson(state.file, {});
	if (existing.pid === process.pid && existing.state === "registered") {
		writeReceipt(state, "registered", { lastServerMessageAt: now });
	}
}

function writeReceipt(state, name, details = {}) {
	const now = new Date().toISOString();
	const existing = readJson(state.file, {});
	const value = {
		schemaVersion: 4, state: name, pid: process.pid,
		tunnelId: details.tunnelId || existing.tunnelId || state.identity.tunnelId || "",
		tunnelName: details.tunnelName || existing.tunnelName || state.config.tunnelName || "",
		agentVersion: existing.agentVersion || "compatibility-launcher",
		activationId: process.env.AWTSMOOS_ACTIVATION_ID || "",
		runtimeVersion: process.env.AWTSMOOS_RUNTIME_VERSION || "unknown",
		generation: state.generation, reconnectAttempt: Number(existing.reconnectAttempt || 0),
		updatedAt: now,
		registeredAt: name === "registered" ? existing.registeredAt || now : existing.registeredAt || null,
		lastServerMessageAt: details.lastServerMessageAt || existing.lastServerMessageAt || null,
		serverTime: details.serverTime || existing.serverTime || null,
		reason: String(details.reason || "")
	};
	atomicWrite(state.file, value);
}

function parseMessage(raw) {
	try { return typeof raw === "string" || Buffer.isBuffer(raw) ? JSON.parse(String(raw)) : raw; }
	catch { return null; }
}

function readJson(file, fallback) {
	try { return JSON.parse(fs.readFileSync(file, "utf8")); }
	catch { return fallback; }
}

function atomicWrite(file, value) {
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
}

module.exports = { attach, nativeReceiptSupported };
