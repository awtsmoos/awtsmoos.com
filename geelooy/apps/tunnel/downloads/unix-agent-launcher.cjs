#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Adds structured ACK testimony to compatible archived agents.
 * @description
 * The Awtsmoos renews old code without erasing its identity. Awtsmoos.com observes
 * the relay through this narrow wrapper and preserves both the friendly tunnel name
 * and the authoritative tunnel ID for transactional health checks.
 */
const root = path.resolve(
	process.argv[2] || process.env.AWTSMOOS_INSTALL_ROOT || __dirname
);
process.env.AWTSMOOS_INSTALL_ROOT = root;
const receiptPath = path.join(root, "connection-state.json");
const config = readJson(path.join(root, "config.json"), {});
let generation = 0;

patchSocket();
launch();

function patchSocket() {
	const modulePath = path.join(root, "lib", "ws.js");
	const WebSocket = require(modulePath).TinyWebSocket;
	const originalEmit = WebSocket.prototype.emit;
	WebSocket.prototype.emit = function patchedEmit(eventName, ...argumentsList) {
		if (eventName === "open") {
			generation += 1;
			writeReceipt("socket_open");
		}
		if (eventName === "message") {
			observeServerMessage(argumentsList[0]);
		}
		if (eventName === "close") {
			writeReceipt("closed", { reason: "socket_closed" });
		}
		return originalEmit.call(this, eventName, ...argumentsList);
	};
}

function observeServerMessage(raw) {
	const message = parseMessage(raw);
	if (message?.type !== "TUNNEL_ACK") return;
	writeReceipt(
		message.ok === true ? "registered" : "registration_rejected",
		{
			tunnelId: message.tunnelId || "",
			tunnelName: message.tunnelName || message.name || config.tunnelName || "",
			serverTime: message.serverTime || null,
			lastServerMessageAt: new Date().toISOString(),
			reason: message.ok === true
				? ""
				: String(message.error || "registration_rejected")
		}
	);
}

function parseMessage(raw) {
	try {
		return typeof raw === "string" || Buffer.isBuffer(raw)
			? JSON.parse(String(raw))
			: raw;
	} catch {
		return null;
	}
}

function launch() {
	writeReceipt("launching");
	const mainModule = require(path.join(root, "main.js"));
	if (typeof mainModule?.main !== "function") return;
	Promise.resolve(mainModule.main()).catch((error) => {
		writeReceipt("error", { reason: error.message });
		console.error(error.stack || error.message);
		process.exit(1);
	});
}

function writeReceipt(state, details = {}) {
	const now = new Date().toISOString();
	const existing = readJson(receiptPath, {});
	const value = {
		schemaVersion: 2,
		state,
		pid: process.pid,
		tunnelId: details.tunnelId || existing.tunnelId || "",
		tunnelName: details.tunnelName || existing.tunnelName || config.tunnelName || "",
		agentVersion: existing.agentVersion || "compatibility-launcher",
		generation,
		updatedAt: now,
		registeredAt: state === "registered" ? now : existing.registeredAt || null,
		lastServerMessageAt: details.lastServerMessageAt || existing.lastServerMessageAt || null,
		serverTime: details.serverTime || existing.serverTime || null,
		reason: String(details.reason || "")
	};
	atomicWrite(receiptPath, value);
}

function readJson(file, fallback) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return fallback;
	}
}

function atomicWrite(file, value) {
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
	fs.renameSync(temporary, file);
}
