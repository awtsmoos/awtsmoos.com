// B"H
const assert = require("assert");
const { appRoute, classifyCandidateResult, publicOrigin, publicUrlReport, verificationPlan } = require("../publicUrls.js");

assert.strictEqual(publicOrigin({ publicOrigin: "https://example.com/" }), "https://example.com");
assert.strictEqual(appRoute("alias", "Coby/apps/demo/index.html"), "/apps/demo/index.html");
assert.strictEqual(appRoute("alias", "apps/demo/index.html"), "/apps/demo/index.html");
assert.strictEqual(appRoute("alias", "src/file.js"), "");

const report = publicUrlReport({ path: "project/Coby/apps/demo/index.html", publicOrigin: "https://example.com/" });
assert.strictEqual(report.aliasId, "project");
assert.strictEqual(report.innerPath, "Coby/apps/demo/index.html");
assert.strictEqual(report.appPath, "/apps/demo/index.html");
assert.strictEqual(report.verification.required, true);
assert(report.candidates.includes("https://example.com/apps/demo/index.html"));
assert(report.candidates.includes("https://example.com/geelooy/os/project/Coby/apps/demo/index.html"));
assert(report.verification.guidance.includes("DYN_ROUTE_NOT_FOUND"));

const plan = verificationPlan(["https://example.com/apps/demo"]);
assert.strictEqual(plan.required, true);
assert(plan.rejectPatterns.includes("DYN_ROUTE_NOT_FOUND"));

assert.deepStrictEqual(classifyCandidateResult({ status: 404, body: "DYN_ROUTE_NOT_FOUND" }).ok, false);
assert.strictEqual(classifyCandidateResult({ status: 200, body: "<!doctype html><main>OK</main>" }).verdict, "candidate_verified");
assert.strictEqual(classifyCandidateResult({ status: 0, body: "plain text" }).verdict, "inconclusive");

const plain = publicUrlReport({ path: "project/README.md" });
assert.strictEqual(plain.appPath, "");
assert(plain.candidates.some(url => url.includes("/geelooy/os/project/README.md")));
console.log("BHY public URL report tests passed");
