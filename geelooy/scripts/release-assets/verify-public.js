#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Catalog = require("./catalog.js");
const Fingerprint = require("./fingerprint.js");

/**
 * Verify deployed public release assets against the still-present source witnesses.
 * Set AWTSMOOS_ASSET_ORIGIN to test a non-production host while preserving `/sites/...` paths.
 */
async function main() {
	const origin = String(process.env.AWTSMOOS_ASSET_ORIGIN || "https://awtsmoos.com").replace(/\/$/, "");
	const projectRoot = process.env.AWTSMOOS_PROJECT_ROOT || process.cwd();
	const results = [];
	for (const item of Catalog.ENTRIES) {
		const expected = Fingerprint.fingerprintFile(Catalog.absoluteLocalPath(projectRoot, item));
		const url = new URL(item.publicUrl, origin);
		const head = await fetch(url, { method: "HEAD" });
		if (!head.ok) throw new Error(`ASSET_HEAD_FAILED:${item.id}:${head.status}`);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`ASSET_GET_FAILED:${item.id}:${response.status}`);
		const actual = Fingerprint.fingerprintBuffer(Buffer.from(await response.arrayBuffer()));
		if (actual.sha256 !== expected.sha256 || actual.bytes !== expected.bytes) {
			throw new Error(`ASSET_PUBLIC_HASH_MISMATCH:${item.id}`);
		}
		results.push({ id: item.id, url: url.href, ...actual });
	}
	process.stdout.write(`${JSON.stringify({ ok: true, results }, null, 2)}\n`);
}

main().catch(error => {
	process.stderr.write(`${error.stack || error}\n`);
	process.exitCode = 1;
});
