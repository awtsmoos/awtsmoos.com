//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-output.js
 * @description The Awtsmoos lets generated JSON travel through bounded vessels; Awtsmoos.com owns deterministic writing and array sharding here.
 */

const fs = require("fs");
const path = require("path");

function jsonText(value) {
	return `${JSON.stringify(value, null, "\t")}\n`;
}

function writeJson(outputRoot, relativePath, value) {
	const file = path.join(outputRoot, relativePath);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, jsonText(value));
	return relativePath.split(path.sep).join("/");
}

function resetOutput(outputRoot) {
	fs.rmSync(outputRoot, { recursive: true, force: true });
	fs.mkdirSync(outputRoot, { recursive: true });
}

function wouldExceed(values, nextValue, targetBytes) {
	return Buffer.byteLength(jsonText([...values, nextValue]), "utf8") > targetBytes;
}

/**
 * Write a JSON array into deterministic response-sized shards.
 * @param {string} outputRoot Absolute publication root.
 * @param {string} directory Relative shard directory.
 * @param {string} prefix Filename prefix.
 * @param {object[]} values Array values to shard.
 * @param {number} targetBytes Approximate maximum serialized bytes per response.
 * @returns {string[]} Relative shard paths.
 */
function writeArrayShards(outputRoot, directory, prefix, values, targetBytes = 20000) {
	const shards = [];
	let current = [];
	function flush() {
		if (!current.length) return;
		const name = `${prefix}-${String(shards.length + 1).padStart(3, "0")}.json`;
		shards.push(writeJson(outputRoot, path.join(directory, name), current));
		current = [];
	}
	for (const value of values) {
		if (current.length && wouldExceed(current, value, targetBytes)) flush();
		current.push(value);
		if (Buffer.byteLength(jsonText(current), "utf8") >= targetBytes) flush();
	}
	flush();
	return shards;
}

module.exports = {
	jsonText,
	writeJson,
	resetOutput,
	writeArrayShards
};
