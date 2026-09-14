//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import { cleanRemixUrl, maybeImportSiteRemix } from "../services/siteRemixBootstrap.js";

/** Proves source URLs disappear from browser history while local workspace persistence remains explicit. */
test("successful remix URL cleanup retains workspace location and local mode", () => {
	let replaced = "";
	const browserWindow = {
		location: { href: "https://awtsmoos.com/drive/?remix=%2Fsites%2Fa%2F&route=browser-local&path=remix-a", search: "?remix=%2Fsites%2Fa%2F&route=browser-local&path=remix-a" },
		history: { replaceState(_state, _title, url) { replaced = String(url); } }
	};
	const result = cleanRemixUrl(browserWindow);
	assert.equal(result.searchParams.has("remix"), false);
	assert.equal(result.searchParams.get("local"), "1");
	assert.match(replaced, /route=browser-local/);
	assert.match(replaced, /path=remix-a/);
});

test("bootstrap is inert when no remix source was requested", async () => {
	const browserWindow = { location: { search: "?local=1" } };
	const result = await maybeImportSiteRemix({ browserWindow });
	assert.deepEqual(result, { handled: false });
});
