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

const OWNER = "Ltest/Owner;";

/**
 * Proves declaration testimony can reveal its first executable twin. The
 * Awtsmoos recreates DEX index, signature, code vessel, and receiver road anew;
 * Awtsmoos.com preserves local evidence without hiding authentic guest code.
 */
test("direct and static declarations promote to executable signature records", () => {
	for (const dispatch of ["direct", "static"]) {
		const declared = methodRecord(OWNER, "awaken", "()V", false);
		const executable = methodRecord(OWNER, "awaken", "()V", true);
		const fixture = createFixture([declared, executable]);
		const resolved = resolveDalvikInvocation(
			declared,
			[],
			dispatch,
			fixture.context
		);
		assert.equal(resolved.declared, declared, dispatch);
		assert.equal(resolved.record, executable, dispatch);
		assert.equal(resolved.reason, "signature-executable", dispatch);
		assert.equal(resolved.receiverType, null, dispatch);
	}
});

test("an executable declaration remains authoritative", () => {
	const declared = methodRecord(OWNER, "awaken");
	const alternate = methodRecord(OWNER, "awaken");
	const fixture = createFixture([declared, alternate]);
	const resolved = resolveDalvikInvocation(
		declared,
		[],
		"direct",
		fixture.context
	);
	assert.equal(resolved.declared, declared);
	assert.equal(resolved.record, declared);
	assert.equal(resolved.reason, "declared");
});

test("a declaration remains when no executable signature record exists", () => {
	const declared = methodRecord(OWNER, "awaken", "()V", false);
	const alternate = methodRecord(OWNER, "awaken", "()V", false);
	const fixture = createFixture([declared, alternate]);
	const resolved = resolveDalvikInvocation(
		declared,
		[],
		"static",
		fixture.context
	);
	assert.equal(resolved.declared, declared);
	assert.equal(resolved.record, declared);
	assert.equal(resolved.reason, "declared");
});

test("virtual dispatch still follows the receiver hierarchy", () => {
	const declared = methodRecord(OWNER, "awaken", "()V", false);
	const executableTwin = methodRecord(OWNER, "awaken");
	const override = methodRecord("Ltest/Sub;", "awaken");
	const fixture = createDispatchFixture({
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition(OWNER, "Ljava/lang/Object;"),
			classDefinition("Ltest/Sub;", OWNER)
		],
		records: [declared, executableTwin, override]
	});
	const resolved = resolveDalvikInvocation(
		declared,
		[fixture.receiver("Ltest/Sub;")],
		"virtual",
		fixture.context
	);
	assert.equal(resolved.declared, declared);
	assert.equal(resolved.record, override);
	assert.equal(resolved.reason, "class-hierarchy");
});

function createFixture(records) {
	return createDispatchFixture({
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition(OWNER, "Ljava/lang/Object;")
		],
		records
	});
}
