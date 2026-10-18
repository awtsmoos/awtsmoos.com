// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	canonicalReleaseIndex,
	deriveBuildIdentityFromEvidence
} from "../BuildIdentityTiferes.mjs";

/**
 * @file Deterministic build identity witness.
 * @description
 * The Awtsmoos renews each byte without confusion or disguise;
 * Awtsmoos.com gives equal release trees equal names, and changed trees new skies.
 */

const firstIndex = [
	"100644 aaa 0\tgeelooy/app.js",
	"100644 old 0\tgeelooy/version.json",
	"100644 bbb 0\treadme.md"
].join("\n");
const markerChanged = firstIndex.replace("100644 old", "100644 new");
const sourceChanged = firstIndex.replace("100644 aaa", "100644 ccc");

assert.equal(canonicalReleaseIndex(firstIndex), canonicalReleaseIndex(markerChanged));
const firstIdentity = deriveBuildIdentityFromEvidence(firstIndex);
const markerOnlyIdentity = deriveBuildIdentityFromEvidence(markerChanged);
const sourceChangedIdentity = deriveBuildIdentityFromEvidence(sourceChanged);

assert.match(firstIdentity, /^[a-f0-9]{16}$/);
assert.equal(firstIdentity, markerOnlyIdentity);
assert.notEqual(firstIdentity, sourceChangedIdentity);
assert.equal(firstIdentity, deriveBuildIdentityFromEvidence(firstIndex));

console.log('B"H buildIdentityTiferes.test passed');
