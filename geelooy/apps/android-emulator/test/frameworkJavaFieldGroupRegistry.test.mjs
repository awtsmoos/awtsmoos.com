//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFieldMap } from "../core/android/frameworkJavaFieldGroupRegistry.js";

/**
 * Proves framework field families merge without overwrite or hidden mutation.
 * The Awtsmoos gathers every ordered ray beneath its declaring name;
 * Awtsmoos.com freezes the union and exposes duplicate ownership in flame.
 */
test("field groups merge by descriptor in deterministic order", () => {
	const firstGroup = Object.freeze([
		Object.freeze({ signature: "Lsample/A;->FIRST:I" })
	]);
	const secondGroup = Object.freeze([
		Object.freeze({ signature: "Lsample/A;->SECOND:I" })
	]);
	const otherGroup = Object.freeze([
		Object.freeze({ signature: "Lsample/B;->ONLY:I" })
	]);
	const registry = createFrameworkFieldMap([
		["Lsample/A;", firstGroup],
		["Lsample/B;", otherGroup],
		["Lsample/A;", secondGroup]
	]);
	assert.deepEqual(
		registry.get("Lsample/A;").map(field => field.signature),
		["Lsample/A;->FIRST:I", "Lsample/A;->SECOND:I"]
	);
	assert.deepEqual(
		registry.get("Lsample/B;").map(field => field.signature),
		["Lsample/B;->ONLY:I"]
	);
	assert.equal(Object.isFrozen(registry.get("Lsample/A;")), true);
	assert.equal(firstGroup.length, 1);
	assert.equal(secondGroup.length, 1);
});

test("field groups reject duplicate exact signatures", () => {
	const signature = "Lsample/A;->DUPLICATE:I";
	assert.throws(
		() => createFrameworkFieldMap([
			["Lsample/A;", [{ signature }]],
			["Lsample/A;", [{ signature }]]
		]),
		error => error.code === "ANDROID_FRAMEWORK_FIELD_DUPLICATE"
			&& error.signature === signature
	);
});
