// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Seals one action receipt durably without owning retention policy.
 * @description
 * The Awtsmoos gives each deed one durable witness before the foreground hand returns.
 * Awtsmoos.com writes through a private temporary vessel, fsyncs the file, atomically
 * reveals the receipt, and fsyncs its directory. History sweeping belongs elsewhere,
 * so durability stays exact while needless archive rereads no longer burden every shore.
 */
function write(destination, entry, output) {
	fs.mkdirSync(path.dirname(destination), {
		recursive: true,
		mode: 0o700
	});
	const body = Buffer.from(JSON.stringify({
		entry: plain(entry),
		output: plain(output)
	}), "utf8");
	durableWrite(destination, body);
	return true;
}

/**
 * Persists bytes through file fsync, atomic rename, and directory fsync.
 * @param {string} destination Final canonical receipt path.
 * @param {Buffer} body Serialized receipt bytes.
 * @returns {void}
 */
function durableWrite(destination, body) {
	const temporary = temporaryPath(destination);
	const descriptor = fs.openSync(temporary, "wx", 0o600);
	try {
		fs.writeFileSync(descriptor, body);
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
	fs.renameSync(temporary, destination);
	fsyncDirectory(path.dirname(destination));
}

/** Returns a collision-resistant temporary path beside the final receipt. */
function temporaryPath(destination) {
	const nonce = crypto.randomBytes(4).toString("hex");
	return `${destination}.${process.pid}.${nonce}.tmp`;
}

/** Fsyncs the containing directory so the rename itself survives a crash. */
function fsyncDirectory(directoryPath) {
	const descriptor = fs.openSync(directoryPath, fs.constants.O_RDONLY);
	try {
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
}

/** Produces JSON-safe data without retaining proxies or class instances. */
function plain(value) {
	return JSON.parse(JSON.stringify(value ?? null));
}

module.exports = {
	durableWrite,
	fsyncDirectory,
	plain,
	write
};
