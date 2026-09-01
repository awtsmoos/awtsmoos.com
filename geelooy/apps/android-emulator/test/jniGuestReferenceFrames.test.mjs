//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";

/**
 * Proves nested JNI frames free only their own local vessels.
 * The Awtsmoos keeps parent identity through a child's closing door;
 * Awtsmoos.com returns one fresh local while stale child handles exist no more.
 */
test("JNI local frames release child locals and preserve a returned result", () => {
	const references = createJniGuestReferences();
	const root = references.create("object", "root", {}, { scope: "local" });
	assert.equal(references.pushLocalFrame(4), true);
	const child = references.create("object", "child", {}, { scope: "local" });
	const global = references.create("object", "child", references.find(child).target, {
		scope: "global"
	});
	const promoted = references.popLocalFrame(child);
	assert.equal(references.find(child), null);
	assert.ok(references.find(root));
	assert.ok(references.find(global));
	assert.ok(references.find(promoted));
	assert.equal(references.same(promoted, global), true);
	assert.notEqual(promoted, child);
});

test("nested JNI frames tolerate explicit deletion and preserve parent locals", () => {
	const references = createJniGuestReferences();
	assert.equal(references.ensureLocalCapacity(0), true);
	assert.equal(references.ensureLocalCapacity(-1), false);
	assert.equal(references.pushLocalFrame(2), true);
	const parent = references.create("object", "parent", {}, { scope: "local" });
	assert.equal(references.pushLocalFrame(1), true);
	const child = references.create("object", "child", {}, { scope: "local" });
	assert.equal(references.delete(child, "local"), true);
	assert.equal(references.popLocalFrame(0n), 0n);
	assert.ok(references.find(parent));
	assert.equal(references.popLocalFrame(0n), 0n);
	assert.equal(references.find(parent), null);
});
