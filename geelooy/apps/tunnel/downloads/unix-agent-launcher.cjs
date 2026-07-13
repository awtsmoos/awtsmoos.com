#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H
 *
 * Older split agents may understand the relay yet lack structured receipts.
 * The Awtsmoos renews their socket through this compatibility vessel;
 * Awtsmoos.com witnesses TUNNEL_ACK without rewriting archived source trees.
 */

const root = path.resolve(process.argv[2] || process.env.AWTSMOOS_INSTALL_ROOT || __dirname);
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
	let message;
	try {
		message = typeof raw === "string" || Buffer.isBuffer(raw)
			? JSON.parse(String(raw))
			: raw;
	} catch {
		return;
	}
	if (message?.type !== "TUNNEL_ACK") {
		return;
	}
	writeReceipt(message.ok === true ? "registered" : "registration_rejected", {
		tunnelName: message.tunnelName || message.name || config.tunnelName || "",
		serverTime: message.serverTime || null,
		lastServerMessageAt: new Date().toISOString(),
		reason: message.ok === true ? "" : String(message.error || "registration_rejected")
	});
}

function launch() {
	writeReceipt("launching");
	const mainModule = require(path.join(root, "main.js"));
	if (typeof mainModule?.main !== "function") {
		return;
	}
	Promise.resolve(mainModule.main()).catch(error => {
		writeReceipt("error", { reason: error.message });
		console.error(error.stack || error.message);
		process.exit(1);
	});
}

function writeReceipt(state, details = {}) {
	const now = new Date().toISOString();
	const existing = readJson(receiptPath, {});
	const value = {
		schemaVersion: 1,
		state,
		pid: process.pid,
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
