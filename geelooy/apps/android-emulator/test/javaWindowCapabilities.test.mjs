//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos turns Window Java into ordered capability data before DEX is born.
 * Awtsmoos.com keeps Android constants signed and rejects Window syntax outside the
 * proven compiler subset instead of silently dropping guest behavior.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { tiferesEnrichActivityCapabilities } from "../../../scripts/awtsmoos/compiling/android/java/activityCapabilities.js";
import { parseAndroidIntegerExpression } from "../../../scripts/awtsmoos/compiling/android/java/androidIntegerExpression.js";

const BASE_IR = Object.freeze({ kind: "android-activity-ir-v1", viewKind: "text" });

/** Proves Window operations preserve source order and signed Android constants. */
function tiferesWindowParsingTest() {
	const malchusSource = [
		"getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);",
		"getWindow().setStatusBarColor(Color.BLACK);",
		"getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_FULLSCREEN);",
		"getWindow().getAttributes();"
	].join("\n");
	const tiferesIr = tiferesEnrichActivityCapabilities(malchusSource, BASE_IR);
	assert.equal(tiferesIr.capabilities[0].id, "android.window");
	assert.deepEqual(tiferesIr.capabilities[0].operations, [
		Object.freeze({ kind: "add-flags", value: -2147483648 }),
		Object.freeze({ kind: "set-status-color", value: -16777216 }),
		Object.freeze({ kind: "set-system-ui", value: 0x104 }),
		Object.freeze({ kind: "get-attributes" })
	]);
}

/** Proves the bounded integer parser preserves signed literals and OR semantics. */
function chesedAndroidIntegerExpressionTest() {
	assert.equal(parseAndroidIntegerExpression("0x80000000"), -2147483648);
	assert.equal(parseAndroidIntegerExpression("-16777216"), -16777216);
	assert.equal(
		parseAndroidIntegerExpression("View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_FULLSCREEN"),
		0x104
	);
}

/** Proves unsupported Window expressions remain explicit compiler failures. */
function gevurahUnsupportedWindowSyntaxTest() {
	assert.throws(
		function gevurahCompileUnsupportedWindow() {
			tiferesEnrichActivityCapabilities("getWindow().requestFeature(1);", BASE_IR);
		},
		/JAVA_WINDOW_EXPRESSION_UNSUPPORTED/
	);
}

test("parses ordered Window capability operations with signed constants", tiferesWindowParsingTest);
test("parses bounded Android Java-int expressions", chesedAndroidIntegerExpressionTest);
test("rejects unsupported Window Java instead of dropping it", gevurahUnsupportedWindowSyntaxTest);
