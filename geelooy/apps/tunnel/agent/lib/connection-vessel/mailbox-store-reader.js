// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const IO = require("./mailbox-io.js");
const Paths = require("./mailbox-paths.js");

/**
 * @file Keeps mailbox enumeration, lookup, and corrupt-file quarantine out of writes.
 * @description
 * The Awtsmoos lets observation remain light while mutation stays exact. Awtsmoos.com
 * isolates directory scans and structurally invalid-file quarantine from hot-lane put/remove
 * logic so the durable store remains small enough to audit during an emergency.
 */
function files(config, lane) {
	const directory = Paths.lane(config, lane);
	try {
		return fs.readdirSync(directory)
			.filter(name => name.endsWith(".json"))
			.map(name => path.join(directory, name));
	} catch (error) {
		if (error.code === "ENOENT") {
			return [];
		}
		throw error;
	}
}

function list(config, lane) {
	return files(config, lane)
		.map(file => IO.read(file))
		.filter(Boolean)
		.sort((left, right) => String(left.updatedAt).localeCompare(String(right.updatedAt)));
}

function get(config, lane, id) {
	return IO.read(Paths.file(config, lane, required(id)));
}

function quarantineInvalid(config, lane) {
	const moved = [];
	const destination = path.join(Paths.root(config), "quarantine", lane);
	for (const file of files(config, lane)) {
		if (IO.read(file)) {
			continue;
		}
		fs.mkdirSync(destination, { recursive: true });
		const target = path.join(destination, `${Date.now()}-${path.basename(file)}`);
		fs.renameSync(file, target);
		moved.push(target);
	}
	return moved;
}

function required(value) {
	const text = String(value || "").trim();
	if (!text) {
		throw new Error("mailbox_id_required");
	}
	return text;
}

module.exports = { files, get, list, quarantineInvalid };
