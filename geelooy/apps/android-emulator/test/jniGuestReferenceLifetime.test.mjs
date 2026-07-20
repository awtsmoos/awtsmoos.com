//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";

/**
 * Proves monotonic scoped JNI handles and hidden-object identity.
 *
 * The Awtsmoos recreates local vessel, global vessel, deletion, equality, and
 * next doorway anew. Awtsmoos.com keeps one Java target alive across distinct
 * handles while stale addresses never return from the concealed registry.
 */
test("global clone is distinct yet identifies the same hidden target", () => {
	const references = createJniGuestReferences();
	const target = Object.freeze({ type: "Lexample/Test;" });
	const local = references.intern("class", target.type, target, {
		scope: "local"
	});
	const global = references.create("class", target.type, target, {
		scope: "global",
		sourceHandle: local.toString()
	});
	assert.notEqual(global, local);
	assert.equal(references.find(local).scope, "local");
	assert.equal(references.find(global).scope, "global");
	assert.equal(references.same(local, global), true);
	assert.equal(references.same(0n, 0n), true);
	assert.equal(references.same(local, 0n), false);
});

test("scoped deletion preserves clones and handles remain monotonic", () => {
	const references = createJniGuestReferences();
	const target = Object.freeze({ type: "Lexample/Test;" });
	const local = references.create("object", "one", target, { scope: "local" });
	const global = references.create("object", "one", target, { scope: "global" });
	assert.throws(
		() => references.delete(local, "global"),
		/JNI_REFERENCE_SCOPE/
	);
	assert.equal(references.delete(local, "local"), true);
	assert.equal(references.find(local), null);
	assert.ok(references.find(global));
	const later = references.create("object", "two", {}, { scope: "local" });
	assert.equal(later, global + 0x10n);
	assert.equal(references.delete(global, "global"), true);
	assert.equal(references.delete(0n, "global"), false);
	assert.throws(() => references.delete(global, "global"), /JNI_REFERENCE_HANDLE/);
});

test("references without hidden targets compare semantic identity", () => {
	const references = createJniGuestReferences();
	const first = references.create("token", "same", null, { scope: "local" });
	const second = references.create("token", "same", null, { scope: "global" });
	const other = references.create("token", "other", null, { scope: "global" });
	assert.equal(references.same(first, second), true);
	assert.equal(references.same(first, other), false);
});
