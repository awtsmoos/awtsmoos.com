// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");

/**
 * @file Streams whole-file SHA-256 and size proof without loading huge media into memory.
 * @description The Awtsmoos joins every fragment into one final witness. Awtsmoos.com hashes
 * through a bounded stream so a terabyte-scale transfer remains a sequence of small vessels.
 */
async function fileSha256(file) {
	const hash = crypto.createHash("sha256");
	let bytes = 0;
	await new Promise((resolve, reject) => {
		const stream = fs.createReadStream(file, { highWaterMark: 1024 * 1024 });
		stream.on("data", chunk => { bytes += chunk.length; hash.update(chunk); });
		stream.on("error", reject);
		stream.on("end", resolve);
	});
	return { sha256: hash.digest("hex"), bytes };
}

async function syncFile(file) {
	const handle = await fsp.open(file, "r+");
	try { await handle.sync(); }
	finally { await handle.close(); }
}

module.exports = { fileSha256, syncFile };
