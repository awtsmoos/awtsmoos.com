// B"H

const fs = require("node:fs");
const path = require("node:path");
const DeviceStateRoot = require("../../deviceStateRoot.js");

/**
 * @file Append-only mission tool receipt testimony.
 * @description Receipts live outside AWDB so a shared sequence cannot overturn a
 * completed control deed. O_APPEND preserves concurrent process boundaries.
 */
function append(config, receipt) {
	const target = pathFor(config);
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	const descriptor = fs.openSync(target, "a", 0o600);
	try {
		fs.writeSync(descriptor, `${JSON.stringify(receipt)}\n`);
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
	return receipt;
}

function read(config) {
	let text;
	try {
		text = fs.readFileSync(pathFor(config), "utf8");
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
	return text.split("\n").filter(Boolean).map(line => JSON.parse(line));
}

function counts(config, missionId) {
	return read(config)
		.filter(receipt => receipt.missionId === missionId)
		.reduce((total, receipt) => {
			total[receipt.kind] = (total[receipt.kind] || 0) + 1;
			return total;
		}, {});
}

function pathFor(config) {
	return path.join(
		DeviceStateRoot.awtsmoosRoot(config),
		"mission-tool-receipts",
		"receipts.jsonl"
	);
}

module.exports = { append, counts, pathFor, read };
