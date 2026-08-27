//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { resolveDalvikInvocation } from "../core/dalvik/methodDispatch.js";
import {
	classDefinition,
	createDispatchFixture,
	methodRecord
} from "./dalvikDispatchFixture.mjs";

/**
 * Proves that no-code Android hierarchy records do not shadow the canonical
 * framework declaration. The Awtsmoos renews receiver garment and external
 * contract; Awtsmoos.com replaces declarations only with executable guest code.
 */
test("virtual dispatch preserves declared framework methods", () => {
	const declared = methodRecord(
		"Landroid/content/Context;",
		"getSystemService",
		"(Ljava/lang/String;)Ljava/lang/Object;",
		false
	);
	const shadow = methodRecord(
		"Landroid/app/Activity;",
		"getSystemService",
		"(Ljava/lang/String;)Ljava/lang/Object;",
		false
	);
	const fixture = createDispatchFixture({
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition(
				"Landroid/content/Context;",
				"Ljava/lang/Object;"
			),
			classDefinition(
				"Landroid/app/Activity;",
				"Landroid/content/Context;"
			),
			classDefinition(
				"Ltest/MainActivity;",
				"Landroid/app/Activity;"
			)
		],
		records: [declared, shadow]
	});
	const resolved = resolveDalvikInvocation(
		declared,
		[fixture.receiver("Ltest/MainActivity;")],
		"virtual",
		fixture.context
	);
	assert.equal(resolved.record, declared);
	assert.equal(resolved.reason, "framework-fallback");
	assert.equal(resolved.receiverType, "Ltest/MainActivity;");
});

test("virtual dispatch still finds executable inherited guest code", () => {
	const declared = methodRecord("Ltest/Base;", "run", "()V", false);
	const executable = methodRecord("Ltest/Ancestor;", "run", "()V", true);
	const fixture = createDispatchFixture({
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition("Ltest/Ancestor;", "Ljava/lang/Object;"),
			classDefinition("Ltest/Base;", "Ltest/Ancestor;"),
			classDefinition("Ltest/Child;", "Ltest/Base;")
		],
		records: [declared, executable]
	});
	const resolved = resolveDalvikInvocation(
		declared,
		[fixture.receiver("Ltest/Child;")],
		"virtual",
		fixture.context
	);
	assert.equal(resolved.record, executable);
	assert.equal(resolved.reason, "class-hierarchy");
});
