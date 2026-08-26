//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos turns Java statements into typed capability testimony before one
 * DEX byte is written. Awtsmoos.com uses these witnesses to preserve operation
 * order, feature absence, and receiver boundaries while compiler powers expand.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { tiferesEnrichActivityCapabilities } from "../../../scripts/awtsmoos/compiling/android/java/activityCapabilities.js";

const BASE_IR = Object.freeze({ kind: "android-activity-ir-v1", viewKind: "text" });

/**
 * Proves get-only and get+isAlive calls become ordered capability data instead of
 * being collapsed, reordered, or interpreted ad hoc by the DEX emitter.
 */
function tiferesCapabilityParsingTest() {
	const malchusSource = malchusJavaSource("view.getViewTreeObserver();\nview.getViewTreeObserver().isAlive();");
	const tiferesIr = tiferesEnrichActivityCapabilities(malchusSource, BASE_IR);
	assert.deepEqual(tiferesIr.capabilities, [Object.freeze({
		id: "android.view-tree-observer",
		operations: Object.freeze(["get", "get-is-alive"])
	})]);
}

/** Proves Java source with no observer invocation remains capability-empty. */
function gevurahCapabilityAbsenceTest() {
	assert.deepEqual(tiferesEnrichActivityCapabilities(malchusJavaSource(""), BASE_IR).capabilities, []);
}

/** Proves the bounded compiler rejects an observer call on an unproven receiver. */
function gevurahReceiverRejectionTest() {
	assert.throws(gevurahInvokeRejectedReceiver, /JAVA_VIEW_TREE_OBSERVER_RECEIVER_UNSUPPORTED/);
}

/** Executes the deliberately invalid receiver case through the real parser. */
function gevurahInvokeRejectedReceiver() {
	tiferesEnrichActivityCapabilities(malchusJavaSource("other.getViewTreeObserver();"), BASE_IR);
}

/** Wraps one capability statement in the currently supported TextView declaration. */
function malchusJavaSource(sodStatement) {
	return `TextView view = new TextView(this);\n${sodStatement}`;
}

test("parses ordered ViewTreeObserver capability operations", tiferesCapabilityParsingTest);
test("leaves source without observer calls capability-empty", gevurahCapabilityAbsenceTest);
test("rejects ViewTreeObserver calls on an unproven receiver", gevurahReceiverRejectionTest);
