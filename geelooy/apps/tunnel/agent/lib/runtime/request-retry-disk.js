// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./request-retry-disk-paths.js");

/**
 * B"H
 *
 * One request receives one atomically replaced JSON witness. The Awtsmoos renews
 * intent and completion together; Awtsmoos.com fsyncs before rename, rereads after
 * restart, and never exposes a raw request identifier in the receipt filename.
 */
function write(record) {
	const target = Paths.filePath(record.controlRequestId);
	const folder = path.dirname(target);
	const temporary = `${target}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
	fs.mkdirSync(folder, { recursive: true });
	const handle = fs.openSync(temporary, "wx", 0o600);
	try {
		fs.writeFileSync(handle, `${JSON.stringify(record, null, 2)}\n`, "utf8");
		fs.fsyncSync(handle);
	} finally {
		fs.closeSync(handle);
	}
	fs.renameSync(temporary, target);
	Paths.syncDirectory(folder);
	return {
		file: target,
		ref: Paths.receiptRef(record.controlRequestId)
	};
}

function read(controlRequestId) {
	const target = Paths.filePath(controlRequestId);
	try {
		const record = JSON.parse(fs.readFileSync(target, "utf8"));
		return record?.controlRequestId === String(controlRequestId || "")
			? record
			: null;
	} catch (error) {
		if (error.code !== "ENOENT") Paths.quarantine(target);
		return null;
	}
}

function list(limit = 5000) {
	let names = [];
	try {
		names = fs.readdirSync(Paths.directory())
			.filter(name => name.endsWith(".json"));
	} catch {
		return [];
	}
	return names.slice(0, Math.max(1, limit))
		.map(readNamed)
		.filter(Boolean);
}

function readNamed(name) {
	const target = path.join(Paths.directory(), name);
	try {
		return JSON.parse(fs.readFileSync(target, "utf8"));
	} catch {
		Paths.quarantine(target);
		return null;
	}
}

function remove(controlRequestId) {
	try {
		fs.unlinkSync(Paths.filePath(controlRequestId));
		return true;
	} catch (error) {
		return error.code === "ENOENT";
	}
}

function clear() {
	for (const record of list()) {
		remove(record.controlRequestId);
	}
}

module.exports = {
	...Paths,
	clear,
	list,
	read,
	remove,
	write
};
