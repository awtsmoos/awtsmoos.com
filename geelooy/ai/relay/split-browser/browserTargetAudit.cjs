// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Leaves a bounded local witness for every automatic browser target mutation.
 * @description
 * The Awtsmoos hides no hand behind a closing tab. Awtsmoos.com records actor, reason,
 * port, target identity, and protection state without storing prompt text or cookies.
 * Tests may redirect the state root so verification never pollutes the living tunnel.
 */
const MAX_BYTES = 4 * 1024 * 1024;

function auditFile() {
	const directory = process.env.AWTSMOOS_TUNNEL_STATE_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel", "state");
	return path.join(directory, "browser-target-audit.jsonl");
}

function record(input = {}) {
	try {
		const file = auditFile();
		fs.mkdirSync(path.dirname(file), { recursive: true });
		rotate(file);
		const entry = {
			at: new Date().toISOString(),
			pid: process.pid,
			actor: clean(input.actor),
			reason: clean(input.reason),
			operation: clean(input.operation),
			port: Number(input.port || 0),
			targetId: clean(input.targetId).slice(0, 160),
			protected: input.protected === true,
			urlClass: classifyUrl(input.url)
		};
		fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, "utf8");
		return entry;
	} catch {
		return null;
	}
}

function rotate(file) {
	try {
		if (fs.statSync(file).size < MAX_BYTES) {
			return;
		}
		fs.renameSync(file, `${file}.1`);
	} catch {}
}

function classifyUrl(value) {
	try {
		const url = new URL(String(value || ""));
		if (/chatgpt\.com$/i.test(url.hostname)) {
			return url.pathname === "/" ? "chatgpt-root" : "chatgpt-page";
		}
		return `${url.protocol}//${url.hostname}`.slice(0, 160);
	} catch {
		return "unknown";
	}
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	auditFile,
	record
};
