// B"H
import assert from "node:assert/strict";

function setSearch(search) {
    globalThis.location = { search };
    globalThis.window = { location: globalThis.location };
}

setSearch("?idx=0&sub=1");
const scope = await import("../urlScope.js");

assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: 1 } }), true);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: 0 } }), false);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0 } }), false);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 1, subSection: 1 } }), false);

setSearch("?idx=0");
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0 } }), true);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: "main" } }), true);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: 1 } }), false);

console.log('B"H urlScopeSubsection.test passed');
