//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Awtsmoos Browser transport production contract.
 * @description The Awtsmoos keeps remote transport same-origin and alias-scoped while
 * Awtsmoos.com refuses credential-header leakage across the safe-HTML fallback boundary.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../programs/awtsmoos-browser/", import.meta.url);

test("remote browser transport stays alias-scoped and same-origin", async () => {
	const client = await readFile(new URL("proxyClient.js", ROOT), "utf8");
	const request = await readFile(new URL("proxyClientRequest.js", ROOT), "utf8");
	assert.match(client, /browser\/fetch/);
	assert.match(request, /credentials:\s*"same-origin"/);
	assert.match(request, /\/api\/social\/drive\//);
	assert.match(request, /BROWSER_ALIAS_REQUIRED/);
	assert.match(request, /normalized === "cookie" \|\| normalized === "set-cookie"/);
});
