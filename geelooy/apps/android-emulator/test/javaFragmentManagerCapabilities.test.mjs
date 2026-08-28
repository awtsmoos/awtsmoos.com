//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos converts supported FragmentManager Java statements into ordered,
 * typed capability IR. Awtsmoos.com preserves tags and commit intent while every
 * unsupported road fails explicitly instead of evaporating during compilation.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { tiferesEnrichActivityCapabilities } from "../../../scripts/awtsmoos/compiling/android/java/activityCapabilities.js";

const BASE_IR = Object.freeze({ kind: "android-activity-ir-v1", viewKind: "text" });

/** Proves all measured FragmentManager Java roads retain order and semantic payload. */
function tiferesFragmentCapabilityParsingTest() {
	const source = [
		"getFragmentManager();",
		"getFragmentManager().beginTransaction();",
		"getFragmentManager().executePendingTransactions();",
		"getFragmentManager().findFragmentByTag(\"alpha\");",
		"getFragmentManager().beginTransaction().add(new Fragment(), \"beta\").commit();"
	].join("\n");
	const ir = tiferesEnrichActivityCapabilities(source, BASE_IR);
	assert.equal(ir.capabilities.length, 1);
	assert.equal(ir.capabilities[0].id, "android.fragment-manager");
	const operations = ir.capabilities[0].operations;
	assert.deepEqual(operations.map(operation => operation.kind), [
		"get-manager",
		"begin",
		"execute-pending",
		"find-tag",
		"add-fragment"
	]);
	assert.equal(operations[3].tag, "alpha");
	assert.equal(operations[4].tag, "beta");
	assert.equal(operations[4].commit, true);
}

/** Proves uncovered FragmentManager syntax cannot silently compile away. */
function gevurahUnsupportedFragmentSyntaxTest() {
	assert.throws(
		() => tiferesEnrichActivityCapabilities("getFragmentManager().popBackStack();", BASE_IR),
		/JAVA_FRAGMENT_MANAGER_EXPRESSION_UNSUPPORTED/
	);
}

test("parses ordered FragmentManager Java capability operations", tiferesFragmentCapabilityParsingTest);
test("rejects unsupported FragmentManager Java syntax explicitly", gevurahUnsupportedFragmentSyntaxTest);
