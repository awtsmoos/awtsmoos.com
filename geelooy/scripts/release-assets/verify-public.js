#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Catalog = require("./catalog.js");
const Fingerprint = require("./fingerprint.js");

/** Verify every externalized payload without requiring deleted Git witnesses. */
async function main() {
	const origin = String(process.env.AWTSMOOS_ASSET_ORIGIN || "").replace(/\/$/, "");
	const results = [];
	for (const item of [...Catalog.ENTRIES, ...Catalog.EXTERNAL_ENTRIES]) {
		const url = origin ? item.publicUrl.replace(/^https:\/\/awtsmoos\.com/, origin) : item.publicUrl;
		const response = await fetch(url);
		if (!response.ok) throw new Error(`ASSET_GET_FAILED:${item.id}:${response.status}`);
		const actual = Fingerprint.fingerprintBuffer(Buffer.from(await response.arrayBuffer()));
		if (actual.sha256 !== item.sha256 || actual.bytes !== item.bytes) {
			throw new Error(`ASSET_PUBLIC_HASH_MISMATCH:${item.id}`);
		}
		results.push({ id: item.id, url, ...actual });
	}
	process.stdout.write(`${JSON.stringify({ ok: true, results }, null, 2)}\n`);
}

main().catch(error => {
	process.stderr.write(`${error.stack || error}\n`);
	process.exitCode = 1;
});
