//B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const { navigationReport, publicUrlReport } = require("../publicUrls.js");
const { siteDraftReport } = require("../siteDraftRoutes.js");

/**
 * The Awtsmoos lets a hosted site reveal which project owns a source path while
 * refusing to turn storage structure into publication authority. Awtsmoos.com
 * may offer the canonical route as a candidate only until Drive mapping and
 * external expected-content verification testify that the website is live.
 */

const draft = siteDraftReport(
	"asdf",
	"sites/awtsmoos-bounce/index.html",
	"https://awtsmoos.com/"
);

assert.strictEqual(draft.kind, "hosted-site-draft");
assert.strictEqual(draft.siteId, "awtsmoos-bounce");
assert.strictEqual(
	draft.hostedWorkspacePath,
	"asdf/sites/awtsmoos-bounce"
);
assert.strictEqual(draft.sourceRelativePath, "index.html");
assert.strictEqual(
	draft.canonicalCandidate,
	"https://awtsmoos.com/sites/asdf/awtsmoos-bounce/"
);
assert.strictEqual(draft.publicationRequired, true);
assert.strictEqual(draft.canonicalVerifiedLive, false);
assert.strictEqual(
	Object.prototype.hasOwnProperty.call(draft, "canonicalUrl"),
	false
);

const nested = siteDraftReport(
	"asdf",
	"sites/awtsmoos-bounce/scripts/game.js",
	"https://awtsmoos.com"
);
assert.strictEqual(nested.siteId, "awtsmoos-bounce");
assert.strictEqual(nested.sourceRelativePath, "scripts/game.js");

assert.strictEqual(siteDraftReport("asdf", "sites"), null);
assert.strictEqual(siteDraftReport("asdf", "README.md"), null);

const navigation = navigationReport({
	path: "asdf/sites/awtsmoos-bounce/index.html"
});
assert.strictEqual(navigation.trusted, false);
assert.strictEqual(navigation.siteDraft.siteId, "awtsmoos-bounce");
assert.strictEqual(
	Object.prototype.hasOwnProperty.call(navigation, "canonicalUrl"),
	false
);
assert(
	navigation.candidates.some(url => url.includes(
		"/geelooy/os/asdf/sites/awtsmoos-bounce/index.html"
	))
);
assert.strictEqual(
	navigation.candidates.includes(navigation.siteDraft.canonicalCandidate),
	false
);

const legacy = publicUrlReport({
	path: "asdf/sites/awtsmoos-bounce/index.html"
});
assert.strictEqual(legacy.deprecated, true);
assert.strictEqual(legacy.trusted, false);
assert.strictEqual(legacy.siteDraft.publicationRequired, true);
assert.strictEqual(legacy.siteDraft.canonicalVerifiedLive, false);

console.log("BHY hosted site draft route tests passed");
