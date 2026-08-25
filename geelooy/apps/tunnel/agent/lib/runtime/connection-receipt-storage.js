// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const FILE_NAME = "connection-state.json";

/**
 * @file Owns atomic filesystem persistence for the supervised connection receipt.
 * @description
 * The Awtsmoos lets identity survive a vanishing process; Awtsmoos.com writes one complete
 * vessel beside the installed runtime, renaming atomically so no half-written generation
 * can masquerade as truth when recovery awakens after a sudden interruption of the night.
 */
function receiptPath(root) {
	return path.join(root, FILE_NAME);
}

function readRaw(root) {
	try {
		return JSON.parse(fs.readFileSync(receiptPath(root), "utf8"));
	} catch {
		return null;
	}
}

function writeRaw(root, value) {
	const target = receiptPath(root);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(
		temporary,
		`${JSON.stringify(value, null, 2)}
`,
		{ mode: 0o600 }
	);
	fs.renameSync(temporary, target);
}

function clear(root) {
	try {
		fs.unlinkSync(receiptPath(root));
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}
}

module.exports = {
	FILE_NAME,
	clear,
	readRaw,
	receiptPath,
	writeRaw
};
