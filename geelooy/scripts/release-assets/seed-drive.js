#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("./catalog.js");
const Fingerprint = require("./fingerprint.js");
const { writeDriveFile } = require("../../api/social/helper/drive/writeService.js");

/**
 * Seed source-external release payload into the server's real Drive root.
 * AWTSMOOS_DB_ROOT is mandatory so a workstation can never impersonate production storage.
 */
async function main() {
	const projectRoot = path.resolve(process.env.AWTSMOOS_PROJECT_ROOT || process.cwd());
	const databaseRoot = String(process.env.AWTSMOOS_DB_ROOT || "").trim();
	if (!databaseRoot) throw new Error("AWTSMOOS_DB_ROOT_REQUIRED");
	process.awtsmoosDbPath = path.resolve(databaseRoot);
	const results = [];
	for (const item of Catalog.ENTRIES) {
		const source = Catalog.absoluteLocalPath(projectRoot, item);
		const content = fs.readFileSync(source);
		const expected = Fingerprint.fingerprintBuffer(content);
		const written = await writeDriveFile({
			aliasId: Catalog.ALIAS_ID,
			path: item.remotePath,
			content,
			mime: item.mime,
			visibility: "public",
			cachePolicy: "immutable",
			actorUserId: "release-assets-migration",
			requestId: `release-asset:${item.id}`,
			$i: { db: { directory: process.awtsmoosDbPath } }
		});
		if (written.entry.objectHash !== expected.sha256 || written.entry.size !== expected.bytes) {
			throw new Error(`ASSET_HASH_MISMATCH:${item.id}`);
		}
		results.push({ id: item.id, publicUrl: item.publicUrl, ...expected });
	}
	process.stdout.write(`${JSON.stringify({ ok: true, aliasId: Catalog.ALIAS_ID, results }, null, 2)}\n`);
}

main().catch(error => {
	process.stderr.write(`${error.stack || error}\n`);
	process.exitCode = 1;
});
