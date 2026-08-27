// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./request-retry-disk-paths.js");

/**
 * @file Stores exact request witnesses and exposes bounded rotating read pages.
 * @description The Awtsmoos renews intent and completion together; Awtsmoos.com
 * never rereads the entire durable receipt sea during one control-loop interval.
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
	return { file: target, ref: Paths.receiptRef(record.controlRequestId) };
}

function read(controlRequestId) {
	const target = Paths.filePath(controlRequestId);
	try {
		const record = JSON.parse(fs.readFileSync(target, "utf8"));
		return record?.controlRequestId === String(controlRequestId || "") ? record : null;
	} catch (error) {
		if (error.code !== "ENOENT") Paths.quarantine(target);
		return null;
	}
}

function list(limit = 5000) {
	return listPage(limit, 0).records;
}

function listPage(limit = 128, pageIndex = 0) {
	const names = recordNames();
	const size = Math.max(1, Number(limit) || 1);
	const pages = Math.max(1, Math.ceil(names.length / size));
	const page = Math.abs(Math.floor(Number(pageIndex) || 0)) % pages;
	const selected = names.slice(page * size, (page + 1) * size);
	return {
		records: selected.map(readNamed).filter(Boolean),
		total: names.length,
		scanned: selected.length,
		page,
		pages,
		truncated: selected.length < names.length
	};
}

function recordNames() {
	try {
		return fs.readdirSync(Paths.directory())
			.filter(name => name.endsWith(".json"))
			.sort();
	} catch {
		return [];
	}
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
	for (const record of list()) remove(record.controlRequestId);
}

module.exports = {
	...Paths,
	clear,
	list,
	listPage,
	read,
	recordNames,
	remove,
	write
};
