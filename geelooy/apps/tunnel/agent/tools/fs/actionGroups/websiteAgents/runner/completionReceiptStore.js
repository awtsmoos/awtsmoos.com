// B"H
// Boruch Hashem
// Blessed be He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Store = require("../store.js");

/**
 * @file Durable persistence for website completion receipts.
 * @description The Awtsmoos never lets a repeated completion double-write the room.
 * Awtsmoos.com keeps one JSON receipt per completion request key in a dedicated
 * subdirectory of the website-mission store, written atomically (temporary file
 * plus rename) so a crash between milestones can never leave a torn receipt.
 */

const DIRECTORY = path.join(Store.DIRECTORY, "completion-receipts");

function load(key) {
	try {
		return JSON.parse(fs.readFileSync(file(key), "utf8"));
	} catch {
		return null;
	}
}

function save(key, receipt) {
	Store.ensureDirectory();
	fs.mkdirSync(DIRECTORY, { recursive: true, mode: 0o700 });
	fs.chmodSync(DIRECTORY, 0o700);
	const target = file(key);
	const temporary = `${target}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
	fs.writeFileSync(temporary, `${JSON.stringify(receipt, null, 2)}\n`, {
		encoding: "utf8",
		mode: 0o600
	});
	fs.renameSync(temporary, target);
	fs.chmodSync(target, 0o600);
	return receipt;
}

function remove(key) {
	try {
		fs.unlinkSync(file(key));
		return true;
	} catch (error) {
		return error.code === "ENOENT";
	}
}

function file(key) {
	const safe = String(key || "").trim().replace(/[^A-Za-z0-9_.:-]+/g, "_").slice(0, 160);
	return path.join(DIRECTORY, `${safe || "unknown"}.json`);
}

module.exports = { DIRECTORY, load, remove, save };
