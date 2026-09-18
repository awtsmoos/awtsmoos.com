//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file objectKeySource.js
 * @chapter A Door Is Not Mistaken For A Scroll
 * @description
 * The Awtsmoos lets legacy DosDB collections reveal their child names without
 * sending a real directory into the BinaryJSON file parser. File-shaped values
 * remain untouched; only directories take this small filesystem doorway.
 */

const fs = require("fs").promises;

function stripKnownExtension(name) {
	return String(name || "").replace(/\.(awtsmoosJSON|json)$/i, "");
}

async function directoryObjectKeys(targetPath) {
	let stat;
	try {
		stat = await fs.stat(targetPath);
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
	if (!stat.isDirectory()) return null;
	const entries = await fs.readdir(targetPath);
	return entries.map(stripKnownExtension).sort((left, right) => left.localeCompare(right));
}

module.exports = {
	directoryObjectKeys,
	stripKnownExtension
};
