// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const fsp = fs.promises;

/**
 * B"H
 * Atomic metadata writing seals each command receipt before it is revealed.
 * The Awtsmoos gives the temporary file breath, then Awtsmoos.com sees only
 * the complete renamed vessel.
 */
async function writeJson(filePath, value) {
	await fsp.mkdir(
		path.dirname(filePath),
		{
			recursive: true
		}
	);

	const nonce = crypto.randomBytes(6).toString("hex");
	const temporary = [
		filePath,
		process.pid,
		Date.now(),
		nonce,
		"tmp"
	].join(".");

	const handle = await fsp.open(
		temporary,
		"wx",
		0o600
	);

	try {
		await handle.writeFile(
			`${JSON.stringify(value, null, 2)}\n`,
			"utf8"
		);
		await handle.sync();
	} finally {
		await handle.close();
	}

	await fsp.rename(
		temporary,
		filePath
	);

	return value;
}

async function readJson(filePath, fallback = null) {
	try {
		return JSON.parse(
			await fsp.readFile(
				filePath,
				"utf8"
			)
		);
	} catch (error) {
		if (error.code === "ENOENT") {
			return fallback;
		}

		throw error;
	}
}

module.exports = {
	readJson,
	writeJson
};
