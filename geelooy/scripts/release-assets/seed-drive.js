#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("./catalog.js");
const Fingerprint = require("./fingerprint.js");
const { writeDriveFile } = require("../../api/social/helper/drive/writeService.js");

/** Seed from an explicit external witness root into an explicit Drive database. */
async function main() {
	const sourceRoot = requiredPath("AWTSMOOS_ASSET_SOURCE_ROOT");
	const databaseRoot = requiredPath("AWTSMOOS_DB_ROOT");
	process.awtsmoosDbPath = databaseRoot;
	const results = [];
	for (const item of Catalog.ENTRIES) {
		const content = fs.readFileSync(Catalog.absoluteSourcePath(sourceRoot, item));
		const expected = Fingerprint.fingerprintBuffer(content);
		if (expected.sha256 !== item.sha256 || expected.bytes !== item.bytes) {
			throw new Error(`ASSET_SOURCE_HASH_MISMATCH:${item.id}`);
		}
		const written = await writeDriveFile({
			aliasId: Catalog.ALIAS_ID, path: item.remotePath, content, mime: item.mime,
			visibility: "public", cachePolicy: "immutable", actorUserId: "release-assets-migration",
			requestId: `release-asset:${item.id}`, $i: { db: { directory: databaseRoot } }
		});
		if (written.entry.objectHash !== item.sha256 || written.entry.size !== item.bytes) {
			throw new Error(`ASSET_HASH_MISMATCH:${item.id}`);
		}
		results.push({ id: item.id, publicUrl: item.publicUrl, ...expected });
	}
	process.stdout.write(`${JSON.stringify({ ok: true, results }, null, 2)}\n`);
}

function requiredPath(name) {
	const value = String(process.env[name] || "").trim();
	if (!value) throw new Error(`${name}_REQUIRED`);
	return path.resolve(value);
}

main().catch(error => {
	process.stderr.write(`${error.stack || error}\n`);
	process.exitCode = 1;
});
