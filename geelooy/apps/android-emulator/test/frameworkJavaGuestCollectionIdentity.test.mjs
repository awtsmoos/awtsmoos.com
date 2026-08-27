//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { guestJavaEquals, guestJavaHash } from "../core/android/frameworkJavaGuestIdentity.js";
import { createJavaMapKeySetView, containsJavaMapKeySetValue, removeJavaMapKeySetValue } from "../core/android/frameworkJavaMapKeySetView.js";
import { getJavaMapValue, initializeJavaMap, javaMapEntries, putJavaMapValue } from "../core/android/frameworkJavaMapStorage.js";
import { addJavaSetValue, containsJavaSetValue, initializeJavaSet, javaSetValues } from "../core/android/frameworkJavaSetStorage.js";
import { createGuestCollectionIdentityFixture } from "./fixtures/guestCollectionIdentityFixture.mjs";

/**
 * Proves Java collections honor executable guest value identity. The Awtsmoos
 * recreates equal references, collisions, legacy hashes, views, and failure anew;
 * Awtsmoos.com preserves canonical insertion while invoking virtual testimony.
 */
test("HashMap replaces and retrieves distinct equal guest keys", async () => {
	const fixture = createGuestCollectionIdentityFixture();
	const map = fixture.object("Ljava/util/HashMap;");
	const first = fixture.key("same", 17);
	const equal = fixture.key("same", 17);
	const collision = fixture.key("other", 17);
	const valueA = fixture.object();
	const valueB = fixture.object();
	initializeJavaMap(fixture.runtime, map);
	assert.equal(putJavaMapValue(fixture.runtime, map, first, valueA), 0);
	assert.equal(await putJavaMapValue(fixture.runtime, map, equal, valueB, fixture.context), valueA);
	assert.equal(javaMapEntries(fixture.runtime, map).size, 1);
	assert.equal(await getJavaMapValue(fixture.runtime, map, equal, fixture.context), valueB);
	assert.equal([...javaMapEntries(fixture.runtime, map).values()][0].key, first);
	assert.equal(await putJavaMapValue(fixture.runtime, map, collision, valueA, fixture.context), 0);
	assert.equal(javaMapEntries(fixture.runtime, map).size, 2);
	assert.ok(fixture.calls.hash >= 4);
	assert.ok(fixture.calls.equals >= 2);
});

test("HashSet and keySet use behavioral identity", async () => {
	const fixture = createGuestCollectionIdentityFixture();
	const set = fixture.object("Ljava/util/HashSet;");
	const first = fixture.key("same", 9);
	const equal = fixture.key("same", 9);
	const collision = fixture.key("other", 9);
	initializeJavaSet(fixture.runtime, set);
	assert.equal(addJavaSetValue(fixture.runtime, set, first), true);
	assert.equal(await addJavaSetValue(fixture.runtime, set, equal, fixture.context), false);
	assert.equal(await addJavaSetValue(fixture.runtime, set, collision, fixture.context), true);
	assert.equal(javaSetValues(fixture.runtime, set).length, 2);
	assert.equal(await containsJavaSetValue(fixture.runtime, set, equal, fixture.context), true);
	const map = fixture.object("Ljava/util/HashMap;");
	initializeJavaMap(fixture.runtime, map);
	await putJavaMapValue(fixture.runtime, map, first, fixture.object(), fixture.context);
	const keys = createJavaMapKeySetView(fixture.runtime, map);
	assert.equal(await containsJavaMapKeySetValue(fixture.runtime, keys, equal, fixture.context), true);
	assert.equal(await removeJavaMapKeySetValue(fixture.runtime, keys, equal, fixture.context), true);
	assert.equal(javaMapEntries(fixture.runtime, map).size, 0);
});

test("identity fallback and guest callback failures remain explicit", async () => {
	const fixture = createGuestCollectionIdentityFixture();
	const first = fixture.object("LPlain;");
	const second = fixture.object("LPlain;");
	assert.equal(guestJavaHash(fixture.runtime, first), first.id);
	assert.equal(guestJavaEquals(fixture.runtime, first, first), true);
	assert.equal(guestJavaEquals(fixture.runtime, first, second), false);
	const map = fixture.object("Ljava/util/HashMap;");
	initializeJavaMap(fixture.runtime, map);
	await assert.rejects(
		putJavaMapValue(
			fixture.runtime,
			map,
			fixture.key("explode", 1),
			fixture.object(),
			fixture.context
		),
		error => error.code === "TEST_GUEST_IDENTITY_CALLBACK"
	);
});
