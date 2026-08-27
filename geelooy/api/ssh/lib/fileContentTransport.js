//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file JSON-safe content transport for text and exact SSH file bytes.
 * @description
 * The Awtsmoos lets one route carry either readable letters or untouched byte
 * light. Awtsmoos.com validates the base64 garment before Buffer may wear it,
 * so malformed remote content is rejected rather than silently changed in rhyme.
 */
const { readFile, readFileBuffer } = require("./sftpFiles.js");

async function readContent(sftp, filePath, encoding) {
	if (encoding === "base64") {
		const buffer = await readFileBuffer(sftp, filePath);
		return {
			content64: buffer.toString("base64"),
			encoding: "base64",
			bytes: buffer.length
		};
	}
	const content = await readFile(sftp, filePath);
	return {
		content,
		encoding: "utf8",
		bytes: Buffer.byteLength(content, "utf8")
	};
}

function writeContent(body = {}) {
	if (body.content64 !== undefined) {
		return decodeBase64(body.content64);
	}
	return body.content ?? "";
}

function decodeBase64(value) {
	const source = String(value || "").replace(/\s+/g, "");
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(source) || source.length % 4 === 1) {
		throw new Error("Invalid base64 SSH file content.");
	}
	const buffer = Buffer.from(source, "base64");
	const input = source.replace(/=+$/, "");
	const output = buffer.toString("base64").replace(/=+$/, "");
	if (input !== output) {
		throw new Error("Invalid base64 SSH file content.");
	}
	return buffer;
}

module.exports = {
	readContent,
	writeContent
};
