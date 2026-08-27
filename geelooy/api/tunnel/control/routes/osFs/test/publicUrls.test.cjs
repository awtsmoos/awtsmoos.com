//B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	appRoute,
	classifyCandidateResult,
	navigationReport,
	publicOrigin,
	publicUrlReport,
	verificationPlan
} = require("../publicUrls.js");

/**
 * The Awtsmoos lets a route candidate remain a humble suggestion until proof
 * arrives. Awtsmoos.com must preserve useful navigation without letting the
 * legacy publicUrl name impersonate canonical website publication.
 */

assert.strictEqual(
	publicOrigin({ publicOrigin: "https://example.com/" }),
	"https://example.com"
);

assert.strictEqual(
	appRoute("alias", "Coby/apps/demo/index.html"),
	"/apps/demo/index.html"
);
assert.strictEqual(
	appRoute("alias", "apps/demo/index.html"),
	"/apps/demo/index.html"
);
assert.strictEqual(appRoute("alias", "src/file.js"), "");

const navigation = navigationReport({
	path: "project/Coby/apps/demo/index.html",
	publicOrigin: "https://example.com/"
});

assert.strictEqual(navigation.kind, "navigation-candidates");
assert.strictEqual(navigation.trusted, false);
assert.strictEqual(navigation.aliasId, "project");
assert.strictEqual(navigation.innerPath, "Coby/apps/demo/index.html");
assert.strictEqual(navigation.appPath, "/apps/demo/index.html");
assert.strictEqual(navigation.verification.required, true);
assert.strictEqual(navigation.siteDraft, null);
assert(navigation.candidates.includes("https://example.com/apps/demo/index.html"));
assert(navigation.candidates.includes(
	"https://example.com/geelooy/os/project/Coby/apps/demo/index.html"
));

const legacy = publicUrlReport({ path: "project/README.md" });
assert.strictEqual(legacy.kind, "navigation-candidates");
assert.strictEqual(legacy.trusted, false);
assert.strictEqual(legacy.deprecated, true);
assert.strictEqual(legacy.siteDraft, null);
assert(legacy.candidates.some(url => url.includes("/geelooy/os/project/README.md")));

const plan = verificationPlan(["https://example.com/apps/demo"]);
assert.strictEqual(plan.required, true);
assert(plan.rejectPatterns.includes("DYN_ROUTE_NOT_FOUND"));
assert(plan.rejectPatterns.includes("404"));

const dynMissing = classifyCandidateResult({
	status: 404,
	body: "DYN_ROUTE_NOT_FOUND"
});
assert.strictEqual(dynMissing.ok, false);
assert.strictEqual(dynMissing.verdict, "rejected");

const htmlCandidate = classifyCandidateResult({
	status: 200,
	body: "<!doctype html><main>OK</main>"
});
assert.strictEqual(htmlCandidate.ok, true);
assert.strictEqual(htmlCandidate.verdict, "candidate_verified");
assert.strictEqual(
	Object.prototype.hasOwnProperty.call(htmlCandidate, "canonicalVerifiedLive"),
	false
);

const inconclusive = classifyCandidateResult({ status: 0, body: "plain text" });
assert.strictEqual(inconclusive.verdict, "inconclusive");

console.log("BHY navigation candidate tests passed");
