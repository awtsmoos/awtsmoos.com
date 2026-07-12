// B"H
const fs = require("node:fs");
const path = require("node:path");

/** B"H — Metadata appears only after a complete temporary vessel is flushed. */
function read(filePath, fallback = null) {
	try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
	catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}

function write(filePath, value, options = {}) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	const current = read(filePath, null);
	if (options.expectedRevision !== undefined && Number(current?.revision || 0) !== options.expectedRevision) {
		throw failure("metadata_revision_conflict", { currentRevision: Number(current?.revision || 0) });
	}
	const next = {
		...value,
		schemaVersion: Number(value.schemaVersion || 1),
		revision: options.incrementRevision === false ? Number(value.revision || 0) : Number(current?.revision ?? value.revision ?? -1) + 1,
		updatedAt: new Date().toISOString()
	};
	const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
	const descriptor = fs.openSync(temporary, "wx", 0o600);
	try {
		fs.writeFileSync(descriptor, `${JSON.stringify(next, null, 2)}\n`, "utf8");
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
	fs.renameSync(temporary, filePath);
	return structuredClone(next);
}

function cleanupTemporary(directory, prefix = "meta.json.") {
	let removed = 0;
	for (const name of safeRead(directory)) {
		if (!name.startsWith(prefix) || !name.endsWith(".tmp")) continue;
		fs.rmSync(path.join(directory, name), { force: true });
		removed += 1;
	}
	return removed;
}

function safeRead(directory) {
	try { return fs.readdirSync(directory); } catch { return []; }
}
function failure(code, details) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}
module.exports = { cleanupTemporary, read, write };
