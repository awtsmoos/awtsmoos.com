//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AsiyahSitesResource } from "../api/AsiyahSitesResource.js";
import { resolveSiteContext } from "./siteContext.js";

/**
 * @file Proves Drive never turns a planned publication route into a clickable false promise.
 * @description
 * The Awtsmoos lets Awtsmoos.com know the future route without calling it present;
 * only server-verified live testimony may become the URL humans can open or copy.
 */

globalThis.location = new URL("https://awtsmoos.test/apps/drive/");

test("siteUrl stays empty until the server verifies the canonical site live", () => {
	const resource = new AsiyahSitesResource();
	const planned = site(false);
	const live = site(true);
	assert.equal(resource.siteUrl(null), "");
	assert.equal(resource.siteUrl(planned), "");
	assert.equal(
		resource.siteUrl(live),
		"https://awtsmoos.com/sites/asdf/example/"
	);
});

test("builder keeps planned identity separate from the live canonical URL", () => {
	const planned = resolveSiteContext({
		currentPath: "sites/example",
		sites: [site(false)]
	});
	assert.equal(planned.canonicalUrl, "");
	assert.equal(planned.plannedCanonicalUrl, "https://awtsmoos.com/sites/asdf/example/");
	assert.equal(planned.canonicalVerifiedLive, false);
	const live = resolveSiteContext({
		currentPath: "sites/example",
		sites: [site(true)]
	});
	assert.equal(live.canonicalUrl, "https://awtsmoos.com/sites/asdf/example/");
	assert.equal(live.canonicalVerifiedLive, true);
});

function site(verified) {
	return {
		id: "example",
		primary: true,
		rootPath: "sites/example",
		project: {
			publication: {
				canonicalVerifiedLive: verified,
				canonicalUrl: "https://awtsmoos.com/sites/asdf/example/",
				route: "/sites/asdf/example/"
			}
		}
	};
}
