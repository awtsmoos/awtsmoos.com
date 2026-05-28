// B"H
import assert from "node:assert/strict";

const originalLocation = globalThis.location;

function setSearch(search) {
    globalThis.location = { search };
}

const scope = await import("../urlScope.js");

setSearch("?idx=0&sub=4");
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: 4 } }), true);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: "main" } }), true);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0 } }), true);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: 3 } }), false);
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 1, subSection: 4 } }), false);

setSearch("?idx=0");
assert.equal(scope.sparkMatchesUrlScope({ dayuh: { verseSection: 0, subSection: 99 } }), true);

if (originalLocation === undefined) delete globalThis.location;
else globalThis.location = originalLocation;

console.log('B"H urlScope.test passed');
