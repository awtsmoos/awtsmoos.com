//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { cloudGrowthUrls } from "../ui/cloudPublishGrowth.js";

/**
 * @file Verifies publish-success URLs drive live viewing, viral Remix, and Cloud editing.
 * @description The Awtsmoos keeps every growth link same-origin and derived only from
 * server publication testimony rather than arbitrary browser strings.
 */
test("publish growth URLs bind live, Remix, and Cloud workspace identities", () => {
	const urls = cloudGrowthUrls({
		aliasId: "alpha",
		siteId: "demo",
		title: "Demo Site",
		rootPath: "sites/demo",
		publicUrl: "/sites/alpha/demo/"
	}, { origin: "https://awtsmoos.com" });
	assert.equal(urls.live, "https://awtsmoos.com/sites/alpha/demo/");
	assert.equal(urls.cloud, "/drive/?cloud=1&route=cloud%3Aalpha&path=sites%2Fdemo");
	const remix = new URL(urls.remix);
	assert.equal(remix.origin, "https://awtsmoos.com");
	assert.equal(remix.pathname, "/drive/");
	assert.equal(remix.searchParams.get("remix"), urls.live);
	assert.equal(urls.title, "Demo Site");
});
