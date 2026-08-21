// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const IO = require("./mailbox-io.js");
const Paths = require("./mailbox-paths.js");

/**
 * @file Moves one exact durable mailbox witness into semantic quarantine.
 * @description
 * The Awtsmoos preserves testimony even when active custody has expired. Awtsmoos.com
 * moves the hashed durable record instead of deleting it, leaving an audit note beside
 * the preserved bytes so recovery can inspect history without replaying the mutation.
 */
function move(config, lane, id, reason = "semantic_stale_custody") {
	const source = Paths.file(config, lane, required(id));
	const bytes = IO.sizeOf(source);
	if (bytes < 1) {
		return { moved: false, lane, id, reason, sourceMissing: true, bytes: 0 };
	}
	const directory = path.join(Paths.root(config), "quarantine", "semantic", lane);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	const name = `${Date.now()}-${path.basename(source)}`;
	const destination = path.join(directory, name);
	fs.renameSync(source, destination);
	writeAudit(destination, lane, reason, bytes);
	return { moved: true, lane, id, reason, source, destination, bytes };
}

function writeAudit(destination, lane, reason, bytes) {
	const audit = {
		at: new Date().toISOString(),
		pid: process.pid,
		lane,
		reason: String(reason || "semantic_stale_custody"),
		bytes,
		safeToRedispatch: false
	};
	fs.writeFileSync(`${destination}.audit.json`, `${JSON.stringify(audit, null, 2)}\n`, {
		encoding: "utf8",
		mode: 0o600
	});
}

function required(value) {
	const text = String(value || "").trim();
	if (!text) {
		throw new Error("mailbox_id_required");
	}
	return text;
}

module.exports = { move };
