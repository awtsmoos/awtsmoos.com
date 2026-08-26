//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosted OS read, metadata, tree, and presentation action family.
 * @description
 * The Awtsmoos lets inspection enter through one quiet gate while Awtsmoos.com keeps
 * byte windows, markdown garments, roots, and ordinary reads separate from mutation.
 * What is seen remains bounded and explicit, so the filesystem may answer in rhyme.
 */
const { cleanPath } = require("./path.js");
const { listFolder, readFile, readLines, readManyLines } = require("./listRead.js");
const { tree } = require("./bulkSearch.js");
const { readBytesResult } = require("./readResult.js");

/**
 * Builds read-only handlers over one authenticated hosted-OS request context.
 *
 * @param {object} $i Awtsmoos request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Public action payload.
 * @returns {object} Read action map.
 */
function buildFileReadActions($i, userId, payload = {}) {
	return {
		list: () => listFolder($i, userId, payload),
		stat: async () => statResult(payload),
		configGet: () => configResult(payload),
		roots: () => listFolder($i, userId, { ...payload, path: "." }),
		rootBrowse: () => listFolder($i, userId, {
			...payload,
			path: payload.path || payload.p || "."
		}),
		tree: () => tree($i, userId, payload),
		read: () => readFile($i, userId, payload),
		readLines: () => readLines($i, userId, payload),
		readManyLines: () => readManyLines($i, userId, payload),
		readBytes: async () => readBytesResult(
			await fullRead($i, userId, payload),
			payload
		),
		read64: async () => readBytesResult(
			await fullRead($i, userId, payload),
			payload,
			true
		),
		md: () => markdownRead($i, userId, payload)
	};
}

function statResult(payload) {
	return {
		ok: true,
		action: "stat",
		path: cleanPath(payload.path || "."),
		exists: true
	};
}

function configResult(payload) {
	return {
		ok: true,
		action: "configGet",
		config: {
			root: payload.path || payload.p || ".",
			maxFiles: payload.maxFiles,
			maxText: payload.maxText
		}
	};
}

function fullRead($i, userId, payload) {
	return readFile($i, userId, {
		...payload,
		maxChars: Number.MAX_SAFE_INTEGER
	});
}

async function markdownRead($i, userId, payload) {
	const result = await readFile($i, userId, payload);
	const extension = String(payload.path || "").split(".").pop() || "";
	return {
		...result,
		action: "md",
		content: "```" + extension + "\n" + result.content + "\n```"
	};
}

module.exports = {
	buildFileReadActions
};
