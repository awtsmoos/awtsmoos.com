//B"H
// Boruch Hashem
// Blessed is He

const { sp } = require("../../../../social/helper/_awtsmoos.constants.js");
const { cleanPath, dbPath } = require("./path.js");
const { syntaxAfterWrite } = require("./syntaxAfterWrite.js");
const { assertWritable } = require("./writeAccess.js");
const {
	inspectExpectedHash,
	sha256
} = require("./writeHashGuard.js");
const {
	broadcast,
	changedPacket,
	routeTestimony
} = require("./writeReceipts.js");

/**
 * @module VirtualOsWriteOperations
 * @description
 * The Awtsmoos lets durable hosted mutation remain small and visible while
 * authority, hashing, and receipt testimony live in their own vessels.
 * Awtsmoos.com changes bytes here; publication remains a higher covenant.
 */

async function writeFile($i, userId, payload) {
	const got = await assertWritable($i, userId, payload);
	if (got.error) {
		return got.error;
	}

	const path = cleanPath(payload.path || payload.p || ".");
	const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
	const wr = await $i.db.write(absolutePath, payload.content ?? "");
	broadcast($i, changedPacket(payload.action || "write", got.parsed, payload));
	const syntax = syntaxAfterWrite(absolutePath);

	return {
		ok: true,
		action: payload.action || "write",
		path,
		absolutePath,
		wr,
		...routeTestimony(payload, got.parsed),
		...(syntax ? { syntax } : {})
	};
}

async function makeFolder($i, userId, payload) {
	const got = await assertWritable($i, userId, payload);
	if (got.error) {
		return got.error;
	}

	const path = cleanPath(payload.path || payload.p || ".");
	const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
	const wr = await $i.db.write(absolutePath);
	broadcast($i, changedPacket("makeFolder", got.parsed, payload));

	return {
		ok: true,
		action: payload.action || "makeFolder",
		path,
		absolutePath,
		wr,
		...routeTestimony(payload, got.parsed)
	};
}

async function deletePath($i, userId, payload) {
	const got = await assertWritable($i, userId, payload);
	if (got.error) {
		return got.error;
	}

	const path = cleanPath(payload.path || payload.p || ".");
	const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
	const deleted = await $i.db.delete(absolutePath);
	broadcast($i, changedPacket(payload.action || "delete", got.parsed, payload));

	return {
		ok: true,
		action: payload.action || "delete",
		path,
		absolutePath,
		deleted,
		...routeTestimony(payload, got.parsed)
	};
}

async function writeIfHash($i, userId, payload) {
	const inspected = await inspectExpectedHash($i, userId, payload);
	if (inspected.error) {
		return inspected.error;
	}

	const wrote = await writeFile($i, userId, payload);
	return {
		...wrote,
		action: "writeIfHash",
		previousSha256: inspected.currentSha,
		sha256: sha256(payload.content ?? "")
	};
}

module.exports = {
	deletePath,
	makeFolder,
	sha256,
	writeFile,
	writeIfHash
};
