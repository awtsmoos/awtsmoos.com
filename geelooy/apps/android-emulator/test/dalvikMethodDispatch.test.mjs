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
 * Proves receiver-aware Dalvik resolution. The Awtsmoos renews declaration,
 * override, interface, and super road; Awtsmoos.com records which guest method
 * truly receives the call instead of forwarding abstract declarations to Android.
 */
test("interface dispatch selects the concrete receiver implementation", () => {
	const declared = methodRecord("Ltest/I;", "call", "()V", false);
	const implementation = methodRecord("Ltest/Impl;", "call");
	const fixture = interfaceFixture(declared, implementation);
	const resolved = resolveDalvikInvocation(
		declared,
		[fixture.receiver("Ltest/Impl;")],
		"interface",
		fixture.context
	);
	assert.equal(resolved.record, implementation);
	assert.equal(resolved.reason, "class-hierarchy");
});

test("virtual dispatch selects overrides and inherited implementations", () => {
	const base = methodRecord("Ltest/Base;");
	const override = methodRecord("Ltest/Sub;");
	const fixture = hierarchyFixture([base, override]);
	const overridden = resolveDalvikInvocation(
		base,
		[fixture.receiver("Ltest/Sub;")],
		"virtual",
		fixture.context
	);
	const inherited = resolveDalvikInvocation(
		base,
		[fixture.receiver("Ltest/Child;")],
		"virtual",
		fixture.context
	);
	assert.equal(overridden.record, override);
	assert.equal(inherited.record, base);
});

test("interface dispatch selects executable default methods", () => {
	const declared = methodRecord("Ltest/I;", "call", "()V", true);
	const fixture = interfaceFixture(declared);
	const resolved = resolveDalvikInvocation(
		declared,
		[fixture.receiver("Ltest/Impl;")],
		"interface",
		fixture.context
	);
	assert.equal(resolved.record, declared);
	assert.equal(resolved.reason, "interface-default");
});

test("super dispatch bypasses the receiver override", () => {
	const base = methodRecord("Ltest/Base;");
	const override = methodRecord("Ltest/Sub;");
	const fixture = hierarchyFixture([base, override], override);
	const resolved = resolveDalvikInvocation(
		base,
		[fixture.receiver("Ltest/Sub;")],
		"super",
		fixture.context
	);
	assert.equal(resolved.record, base);
	assert.equal(resolved.reason, "super-hierarchy");
});

test("interface dispatch rejects incompatible guest receivers", () => {
	const declared = methodRecord("Ltest/I;", "call", "()V", false);
	const fixture = hierarchyFixture([declared]);
	assert.throws(
		() => resolveDalvikInvocation(
			declared,
			[fixture.receiver("Ltest/Sub;")],
			"interface",
			fixture.context
		),
		error => error.code === "DALVIK_INTERFACE_RECEIVER_MISMATCH"
	);
});

function interfaceFixture(declared, implementation = null) {
	return createDispatchFixture({
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition("Ltest/I;", "Ljava/lang/Object;"),
			classDefinition("Ltest/Impl;", "Ljava/lang/Object;", ["Ltest/I;"])
		],
		records: [declared, ...(implementation ? [implementation] : [])]
	});
}

function hierarchyFixture(records, currentRecord = records.at(-1)) {
	return createDispatchFixture({
		currentRecord,
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition("Ltest/I;", "Ljava/lang/Object;"),
			classDefinition("Ltest/Base;", "Ljava/lang/Object;"),
			classDefinition("Ltest/Sub;", "Ltest/Base;"),
			classDefinition("Ltest/Child;", "Ltest/Base;")
		],
		records
	});
}
